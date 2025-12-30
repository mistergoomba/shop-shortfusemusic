/**
 * Import script for BigCartel products into Vendure
 *
 * Usage:
 *   ts-node scripts/import-bigcartel.ts [optional-path-to-products.json]
 *
 * If no path is provided, it will use products.json in the same directory as this script.
 * Example:
 *   ts-node scripts/import-bigcartel.ts
 *   ts-node scripts/import-bigcartel.ts "/path/to/custom/products.json"
 */

import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import FormData from 'form-data';
import 'dotenv/config';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:3000/admin-api';
const ADMIN_USERNAME = process.env.SUPERADMIN_USERNAME || 'superadmin';
const ADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'superadmin';

interface BigCartelProduct {
  id: number;
  name: string;
  permalink: string;
  price: number;
  description: string;
  status: 'active' | 'sold-out';
  images: Array<{ url: string; width: number; height: number }>;
  categories: Array<{ id: number; name: string; permalink: string }>;
  options: Array<{
    id: number;
    name: string;
    price: number;
    sold_out: boolean;
    option_group_values: Array<{ id: number; name: string; option_group_id: number }>;
  }>;
  option_groups: Array<{
    id: number;
    name: string;
    values: Array<{ id: number; name: string; position: number }>;
  }>;
}

interface AuthResponse {
  login: {
    __typename: string;
    id: string;
    identifier: string;
    channels: Array<{ id: string; token: string }>;
  };
}

interface CreateCollectionResponse {
  createCollection: {
    id: string;
    name: string;
    slug: string;
  };
}

interface CreateAssetResponse {
  createAssets: Array<{
    id: string;
    name: string;
    source: string;
    preview: string;
  }>;
}

interface CreateProductResponse {
  createProduct: {
    id: string;
    name: string;
    slug: string;
  };
}

interface CreateProductVariantResponse {
  createProductVariants: Array<{
    id: string;
    name: string;
    sku: string;
  }>;
}

interface CreateFacetResponse {
  createFacet: {
    id: string;
    name: string;
    code: string;
  };
}

interface UpdateProductResponse {
  updateProduct: {
    id: string;
    name: string;
  };
}

class VendureImporter {
  private authToken: string | null = null;
  private channelToken: string | null = null;
  private sessionCookie: string | null = null;
  private collectionsMap: Map<string, string> = new Map(); // collection name -> collection ID
  private sizeFacetId: string | null = null;
  private sizeFacetValuesMap: Map<string, string> = new Map(); // size name -> facet value ID

  async authenticate(): Promise<void> {
    const mutation = `
      mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          ... on CurrentUser {
            id
            identifier
            channels {
              id
              token
            }
          }
        }
      }
    `;

    // Authenticate and capture cookies
    const response = await fetch(ADMIN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important: include cookies
      body: JSON.stringify({
        query: mutation,
        variables: {
          username: ADMIN_USERNAME,
          password: ADMIN_PASSWORD,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    // Extract all cookies from response headers
    const setCookieHeaders = response.headers.getSetCookie?.() || [];
    const allCookies: string[] = [];

    // Also check the raw set-cookie header
    const rawCookieHeader = response.headers.get('set-cookie');
    if (rawCookieHeader) {
      // Parse multiple cookies if present
      const cookies = rawCookieHeader.split(',').map((c) => c.trim().split(';')[0]);
      allCookies.push(...cookies);
    }

    // Combine all cookies
    if (allCookies.length > 0) {
      this.sessionCookie = allCookies.join('; ');
      console.log('[Auth] Session cookies captured:', this.sessionCookie.substring(0, 50) + '...');
    } else {
      console.warn('[Auth] No cookies found in response');
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`Authentication failed: ${JSON.stringify(result.errors)}`);
    }

    const data = result.data as AuthResponse;
    if (data.login && 'channels' in data.login && data.login.channels.length > 0) {
      this.channelToken = data.login.channels[0].token;
      console.log('[Auth] Successfully authenticated with channel token');
    } else {
      throw new Error('Authentication failed - no user returned');
    }
  }

  /**
   * Maps BigCartel category to our simplified collection structure
   */
  private mapCategoryToCollection(categoryName: string): string {
    if (categoryName === 'Albums') {
      return 'Albums';
    } else if (categoryName === 'T-Shirts' || categoryName === 'Headwear') {
      return 'Clothing';
    } else {
      return 'Other';
    }
  }

  async createCollection(name: string, slug: string): Promise<string> {
    // Check if collection already exists
    if (this.collectionsMap.has(name)) {
      return this.collectionsMap.get(name)!;
    }

    const mutation = `
      mutation CreateCollection($input: CreateCollectionInput!) {
        createCollection(input: $input) {
          id
          name
          slug
        }
      }
    `;

    const response = await this.graphqlRequest<CreateCollectionResponse>(mutation, {
      input: {
        translations: [
          {
            languageCode: 'en',
            name: name,
            slug: slug,
            description: '',
          },
        ],
        filters: [],
        assetIds: [],
        featuredAssetId: null,
      },
    });

    const collectionId = response.createCollection.id;
    this.collectionsMap.set(name, collectionId);
    console.log(`[Collection] Created: ${name} (${collectionId})`);
    return collectionId;
  }

  /**
   * Creates the Size facet and facet values for shirt sizes
   */
  async ensureSizeFacet(): Promise<void> {
    if (this.sizeFacetId) {
      return; // Already created and mapped
    }

    // First, check if the facet already exists
    const findFacetQuery = `
      query FindFacet($code: String!) {
        facets(options: { filter: { code: { eq: $code } } }) {
          items {
            id
            code
            values {
              id
              name
              code
            }
          }
        }
      }
    `;

    const existingFacet = await this.graphqlRequest<{
      facets: {
        items: Array<{
          id: string;
          code: string;
          values: Array<{ id: string; name: string; code: string }>;
        }>;
      };
    }>(findFacetQuery, { code: 'size' });

    if (existingFacet.facets.items.length > 0) {
      // Use existing facet
      const facet = existingFacet.facets.items[0];
      this.sizeFacetId = facet.id;
      console.log(`[Facet] Found existing Size facet: ${this.sizeFacetId}`);
    } else {
      // Create the Size facet
      const createFacetMutation = `
        mutation CreateFacet($input: CreateFacetInput!) {
          createFacet(input: $input) {
            id
            name
            code
          }
        }
      `;

      const facetResponse = await this.graphqlRequest<CreateFacetResponse>(createFacetMutation, {
        input: {
          code: 'size',
          isPrivate: false,
          translations: [
            {
              languageCode: 'en',
              name: 'Size',
            },
          ],
          values: [
            { code: 'small', translations: [{ languageCode: 'en', name: 'Small' }] },
            { code: 'medium', translations: [{ languageCode: 'en', name: 'Medium' }] },
            { code: 'large', translations: [{ languageCode: 'en', name: 'Large' }] },
            { code: 'x-large', translations: [{ languageCode: 'en', name: 'X Large' }] },
            { code: 'xx-large', translations: [{ languageCode: 'en', name: 'XX Large' }] },
            { code: 'xxx-large', translations: [{ languageCode: 'en', name: 'XXX Large' }] },
            { code: 'xxxx-large', translations: [{ languageCode: 'en', name: 'XXXX Large' }] },
          ],
        },
      });

      this.sizeFacetId = facetResponse.createFacet.id;
      console.log(`[Facet] Created Size facet: ${this.sizeFacetId}`);
    }

    // Fetch the facet values to map them
    const getFacetQuery = `
      query GetFacet($id: ID!) {
        facet(id: $id) {
          id
          values {
            id
            name
            code
          }
        }
      }
    `;

    const facetData = await this.graphqlRequest<{
      facet: { id: string; values: Array<{ id: string; name: string; code: string }> };
    }>(getFacetQuery, { id: this.sizeFacetId });

    // Map size names to facet value IDs
    for (const value of facetData.facet.values) {
      // Normalize the name for matching (handle variations)
      const normalizedName = value.name.toLowerCase().replace(/\s+/g, '');
      this.sizeFacetValuesMap.set(normalizedName, value.id);
      // Also map by code
      this.sizeFacetValuesMap.set(value.code.toLowerCase(), value.id);
    }

    console.log(`[Facet] Mapped ${this.sizeFacetValuesMap.size} size facet values`);
  }

  /**
   * Gets facet value IDs for a product based on its option groups
   * Only returns facet values for "Size" option groups
   */
  private getSizeFacetValueIds(product: BigCartelProduct): string[] {
    const facetValueIds: string[] = [];

    for (const optionGroup of product.option_groups) {
      if (optionGroup.name.toLowerCase() === 'size') {
        for (const value of optionGroup.values) {
          const normalizedName = value.name.toLowerCase().replace(/\s+/g, '');
          const facetValueId = this.sizeFacetValuesMap.get(normalizedName);
          if (facetValueId) {
            facetValueIds.push(facetValueId);
          } else {
            console.warn(
              `[Facet] No facet value found for size: ${value.name} (normalized: ${normalizedName})`
            );
          }
        }
      }
    }

    return facetValueIds;
  }

  /**
   * Note: Vendure doesn't support assigning products to collections via UpdateProductInput.
   * Collections need to be assigned manually in the admin UI or via collection filters.
   * This method is kept for future use if Vendure adds this capability.
   */
  async assignProductToCollection(productId: string, collectionId: string): Promise<void> {
    // TODO: Implement collection assignment when Vendure API supports it
    // For now, collections will need to be assigned manually in the admin UI
    // or via collection filters that match products by facet values
    console.log(
      `[Collection] Note: Product ${productId} should be assigned to collection ${collectionId} manually`
    );
  }

  async createAsset(imageUrl: string): Promise<string> {
    // Download image from URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image from ${imageUrl}: ${imageResponse.statusText}`);
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1].split('?')[0] || 'image.jpg';
    const tempPath = join(tmpdir(), `vendure-import-${Date.now()}-${filename}`);

    try {
      // Save to temp file
      writeFileSync(tempPath, Buffer.from(imageBuffer));

      // Create FormData for multipart upload using form-data package
      const formData = new FormData();
      formData.append('file', readFileSync(tempPath), {
        filename: filename,
        contentType: imageResponse.headers.get('content-type') || 'image/jpeg',
      });

      // Upload to Vendure using multipart/form-data
      const headers = formData.getHeaders();
      if (this.sessionCookie) {
        headers['Cookie'] = this.sessionCookie;
      }
      if (this.channelToken) {
        headers['vendure-token'] = this.channelToken;
      }

      // Vendure asset upload endpoint - AssetServerPlugin route is 'assets'
      // The endpoint should be at the root level, not under admin-api
      const baseUrl = ADMIN_API_URL.replace('/admin-api', '');
      const uploadResponse = await fetch(`${baseUrl}/assets`, {
        method: 'POST',
        headers: headers as any,
        body: formData as any,
      });

      if (!uploadResponse.ok) {
        const text = await uploadResponse.text();
        throw new Error(`Failed to upload asset: ${uploadResponse.status} - ${text}`);
      }

      const result = await uploadResponse.json();

      // Vendure returns assets in different formats, try to extract ID
      if (result.id) {
        return result.id;
      } else if (result.data && result.data.createAssets && result.data.createAssets.length > 0) {
        return result.data.createAssets[0].id;
      } else if (Array.isArray(result) && result.length > 0 && result[0].id) {
        return result[0].id;
      }

      throw new Error(`Unexpected response format: ${JSON.stringify(result)}`);
    } finally {
      // Clean up temp file
      try {
        unlinkSync(tempPath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  async createProduct(product: BigCartelProduct): Promise<string> {
    // Determine which collection this product belongs to
    const collectionName = this.mapCategoryToCollection(product.categories[0]?.name || 'Other');
    const collectionSlug = collectionName.toLowerCase().replace(/\s+/g, '-');
    const collectionId = await this.createCollection(collectionName, collectionSlug);

    // Create assets (skip if they fail)
    const assetIds: string[] = [];
    for (const image of product.images) {
      try {
        const assetId = await this.createAsset(image.url);
        assetIds.push(assetId);
        // Add small delay to avoid rate limiting
        await this.delay(200);
      } catch (error) {
        console.warn(
          `[Asset] Skipping image ${image.url}: ${error instanceof Error ? error.message : error}`
        );
        // Continue without this image
      }
    }

    if (assetIds.length === 0) {
      console.warn(`[Product] No images imported for ${product.name}, continuing without assets`);
    }

    // Get facet value IDs for this product (only for Clothing with size options)
    let facetValueIds: string[] = [];
    const isClothing = collectionName === 'Clothing';
    if (isClothing) {
      facetValueIds = this.getSizeFacetValueIds(product);
    }

    // Create product
    const createProductMutation = `
      mutation CreateProduct($input: CreateProductInput!) {
        createProduct(input: $input) {
          id
          name
          slug
        }
      }
    `;

    const productResponse = await this.graphqlRequest<CreateProductResponse>(
      createProductMutation,
      {
        input: {
          translations: [
            {
              languageCode: 'en',
              name: product.name,
              slug: product.permalink,
              description: this.cleanDescription(product.description),
            },
          ],
          assetIds: assetIds,
          featuredAssetId: assetIds.length > 0 ? assetIds[0] : null,
          facetValueIds: facetValueIds,
          // collectionIds is not supported in CreateProductInput, so we assign after creation
        },
      }
    );

    const productId = productResponse.createProduct.id;
    console.log(`[Product] Created: ${product.name} (${productId})`);

    // Assign product to collection after creation
    await this.assignProductToCollection(productId, collectionId);

    // Create product variants
    if (product.options && product.options.length > 0) {
      await this.createProductVariants(productId, product);
    } else {
      // Create a single default variant
      await this.createDefaultVariant(productId, product);
    }

    return productId;
  }

  async createProductVariants(productId: string, product: BigCartelProduct): Promise<void> {
    // Group options by option group
    const optionGroupsMap = new Map<
      number,
      { name: string; values: Array<{ id: number; name: string }> }
    >();

    for (const optionGroup of product.option_groups) {
      optionGroupsMap.set(optionGroup.id, {
        name: optionGroup.name,
        values: optionGroup.values,
      });
    }

    // Create option groups in Vendure
    const vendureOptionGroupIds: string[] = [];
    for (const [groupId, group] of optionGroupsMap) {
      const groupId_vendure = await this.createProductOptionGroup(
        productId,
        group.name,
        group.values
      );
      vendureOptionGroupIds.push(groupId_vendure);
    }

    // Create variants for each option combination
    for (const option of product.options) {
      if (option.sold_out && product.status === 'sold-out') {
        continue; // Skip sold-out variants
      }

      const variantInput: any = {
        productId: productId,
        translations: [
          {
            languageCode: 'en',
            name: option.name,
          },
        ],
        sku: `BC-${product.id}-${option.id}`,
        price: option.price * 100, // Convert to cents
        taxCategoryId: null, // Will use default
        stockOnHand: option.sold_out ? 0 : 100, // Default stock
        trackInventory: 'NONE',
        optionIds: [],
      };

      // Map option group values
      if (option.option_group_values && option.option_group_values.length > 0) {
        // This is simplified - you may need to create option values first
        // For now, we'll create variants without option groups
      }

      await this.createVariant(variantInput);
    }
  }

  async createDefaultVariant(productId: string, product: BigCartelProduct): Promise<void> {
    const variantInput = {
      productId: productId,
      translations: [
        {
          languageCode: 'en',
          name: product.name,
        },
      ],
      sku: `BC-${product.id}`,
      price: product.price * 100, // Convert to cents
      taxCategoryId: null,
      stockOnHand: product.status === 'sold-out' ? 0 : 100,
      trackInventory: 'NONE',
      optionIds: [],
    };

    await this.createVariant(variantInput);
  }

  async createVariant(input: any): Promise<void> {
    const mutation = `
      mutation CreateProductVariants($input: [CreateProductVariantInput!]!) {
        createProductVariants(input: $input) {
          id
          name
          sku
        }
      }
    `;

    try {
      const response = await this.graphqlRequest<CreateProductVariantResponse>(mutation, {
        input: [input],
      });
      console.log(`[Variant] Created: ${response.createProductVariants[0]?.name || 'Unknown'}`);
    } catch (error) {
      console.error(`[Variant] Failed to create variant:`, error);
    }
  }

  async createProductOptionGroup(
    productId: string,
    groupName: string,
    values: Array<{ id: number; name: string }>
  ): Promise<string> {
    const mutation = `
      mutation CreateProductOptionGroup($input: CreateProductOptionGroupInput!) {
        createProductOptionGroup(input: $input) {
          id
          name
        }
      }
    `;

    const response = await this.graphqlRequest<any>(mutation, {
      input: {
        productId: productId,
        code: `option-${groupName.toLowerCase().replace(/\s+/g, '-')}`,
        translations: [
          {
            languageCode: 'en',
            name: groupName,
          },
        ],
        options: values.map((v) => ({
          code: `option-${v.name.toLowerCase().replace(/\s+/g, '-')}`,
          translations: [
            {
              languageCode: 'en',
              name: v.name,
            },
          ],
        })),
      },
    });

    return response.createProductOptionGroup.id;
  }

  private cleanDescription(description: string): string {
    // Remove HTML entities and clean up
    return description
      .replace(/\\r\\n/g, '\n')
      .replace(/\\u003C/g, '<')
      .replace(/\\u003E/g, '>')
      .replace(/<a[^>]*>/g, '')
      .replace(/<\/a>/g, '')
      .trim();
  }

  private async graphqlRequest<T>(query: string, variables: any = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Use session cookie for authentication (Vendure Admin API uses cookie-based auth)
    if (this.sessionCookie) {
      headers['Cookie'] = this.sessionCookie;
    }

    // Also include channel token if available (for channel-specific operations)
    if (this.channelToken) {
      headers['vendure-token'] = this.channelToken;
    }

    const response = await fetch(ADMIN_API_URL, {
      method: 'POST',
      headers,
      credentials: 'include', // Include cookies
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors, null, 2)}`);
    }

    return result.data;
  }

  async clearDatabase(): Promise<void> {
    console.log('[Clear] Starting database cleanup...');

    // Step 1: Delete all products (they reference collections and assets)
    console.log('[Clear] Fetching all products...');
    const productsQuery = `
      query GetProducts($options: ProductListOptions) {
        products(options: $options) {
          items {
            id
            name
          }
          totalItems
        }
      }
    `;

    const productsResponse = await this.graphqlRequest<{
      products: { items: Array<{ id: string; name: string }>; totalItems: number };
    }>(productsQuery, {
      options: {
        take: 1000, // Get up to 1000 products
      },
    });

    const products = productsResponse.products.items;
    console.log(`[Clear] Found ${products.length} products to delete`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        const deleteMutation = `
          mutation DeleteProduct($id: ID!) {
            deleteProduct(id: $id) {
              result
              errorCode
            }
          }
        `;
        await this.graphqlRequest(deleteMutation, { id: product.id });
        console.log(`[Clear] Deleted product ${i + 1}/${products.length}: ${product.name}`);
        await this.delay(100); // Small delay to avoid rate limiting
      } catch (error) {
        console.warn(`[Clear] Failed to delete product "${product.name}":`, error);
      }
    }

    // Step 2: Delete all collections
    console.log('[Clear] Fetching all collections...');
    const collectionsQuery = `
      query GetCollections($options: CollectionListOptions) {
        collections(options: $options) {
          items {
            id
            name
          }
          totalItems
        }
      }
    `;

    const collectionsResponse = await this.graphqlRequest<{
      collections: { items: Array<{ id: string; name: string }>; totalItems: number };
    }>(collectionsQuery, {
      options: {
        take: 1000,
      },
    });

    const collections = collectionsResponse.collections.items;
    console.log(`[Clear] Found ${collections.length} collections to delete`);

    for (let i = 0; i < collections.length; i++) {
      const collection = collections[i];
      try {
        const deleteMutation = `
          mutation DeleteCollection($id: ID!) {
            deleteCollection(id: $id) {
              result
              errorCode
            }
          }
        `;
        await this.graphqlRequest(deleteMutation, { id: collection.id });
        console.log(
          `[Clear] Deleted collection ${i + 1}/${collections.length}: ${collection.name}`
        );
        await this.delay(100);
      } catch (error) {
        console.warn(`[Clear] Failed to delete collection "${collection.name}":`, error);
      }
    }

    // Step 3: Delete all assets
    console.log('[Clear] Fetching all assets...');
    const assetsQuery = `
      query GetAssets($options: AssetListOptions) {
        assets(options: $options) {
          items {
            id
            name
          }
          totalItems
        }
      }
    `;

    const assetsResponse = await this.graphqlRequest<{
      assets: { items: Array<{ id: string; name: string }>; totalItems: number };
    }>(assetsQuery, {
      options: {
        take: 1000,
      },
    });

    const assets = assetsResponse.assets.items;
    console.log(`[Clear] Found ${assets.length} assets to delete`);

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      try {
        const deleteMutation = `
          mutation DeleteAsset($id: ID!) {
            deleteAsset(id: $id) {
              result
              errorCode
            }
          }
        `;
        await this.graphqlRequest(deleteMutation, { id: asset.id });
        console.log(`[Clear] Deleted asset ${i + 1}/${assets.length}: ${asset.name}`);
        await this.delay(100);
      } catch (error) {
        console.warn(`[Clear] Failed to delete asset "${asset.name}":`, error);
      }
    }

    // Clear the collections map and reset facet tracking
    this.collectionsMap.clear();
    this.sizeFacetId = null;
    this.sizeFacetValuesMap.clear();

    console.log('[Clear] Database cleanup complete!');
  }

  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

async function main() {
  // Get the directory of the current script
  // ts-node typically provides __dirname in CommonJS mode
  let scriptDir: string;
  
  if (typeof __dirname !== 'undefined') {
    scriptDir = __dirname;
  } else {
    // Fallback: try to find products.json in common locations
    const possiblePaths = [
      join(process.cwd(), 'backend', 'scripts'),
      join(process.cwd(), 'scripts'),
    ];
    
    // Use the first path that contains products.json
    const foundPath = possiblePaths.find(p => {
      try {
        readFileSync(join(p, 'products.json'), 'utf-8');
        return true;
      } catch {
        return false;
      }
    });
    
    scriptDir = foundPath || join(process.cwd(), 'backend', 'scripts');
  }
  
  // Use provided path or default to products.json in the same directory
  const jsonPath = process.argv[2] || join(scriptDir, 'products.json');

  console.log(`[Import] Reading products from: ${jsonPath}`);
  
  try {
    const productsData = JSON.parse(readFileSync(jsonPath, 'utf-8')) as BigCartelProduct[];

    console.log(`[Import] Found ${productsData.length} products to import`);

    const importer = new VendureImporter();

    try {
      console.log('[Import] Authenticating...');
      await importer.authenticate();

      console.log('[Import] Clearing existing data...');
      await importer.clearDatabase();

    console.log('[Import] Creating Size facet...');
    await importer.ensureSizeFacet();

    console.log('[Import] Starting import process...');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < productsData.length; i++) {
      const product = productsData[i];
      try {
        console.log(`[Import] Processing product ${i + 1}/${productsData.length}: ${product.name}`);
        await importer.createProduct(product);
        successCount++;
        // Add delay between products to avoid rate limiting
        await importer.delay(500);
      } catch (error) {
        console.error(`[Import] Failed to import product "${product.name}":`, error);
        errorCount++;
      }
    }

      console.log('\n[Import] Import complete!');
      console.log(`[Import] Successfully imported: ${successCount} products`);
      console.log(`[Import] Failed: ${errorCount} products`);
    } catch (error) {
      console.error('[Import] Fatal error:', error);
      process.exit(1);
    }
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.error(`[Import] Error: File not found: ${jsonPath}`);
      console.error('[Import] Please ensure products.json exists in the scripts directory or provide a valid path.');
    } else {
      console.error('[Import] Error reading products file:', error);
    }
    process.exit(1);
  }
}

main();
