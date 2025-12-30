# Import Scripts

## BigCartel Import

Import products from BigCartel JSON export into Vendure.

### Usage

```bash
npm run import:bigcartel [optional-path-to-products.json]
```

If no path is provided, the script will use `products.json` from the `backend/scripts` directory.

### Example

```bash
# Use products.json from the scripts directory (recommended)
npm run import:bigcartel

# Or specify a custom path
npm run import:bigcartel "/path/to/custom/products.json"
```

Or using ts-node directly:

```bash
# Use products.json from the scripts directory
ts-node scripts/import-bigcartel.ts

# Or specify a custom path
ts-node scripts/import-bigcartel.ts "/path/to/custom/products.json"
```

### Prerequisites

1. **Vendure server must be running** (local or production)
2. **Place `products.json` in the `backend/scripts` directory** (or provide a custom path)
3. **Environment variables** (from `.env`):
   - `ADMIN_API_URL` (default: `http://localhost:3000/admin-api`)
   - `SUPERADMIN_USERNAME` (default: `superadmin`)
   - `SUPERADMIN_PASSWORD` (default: `superadmin`)

### What it does

1. **Authenticates** with Vendure Admin API
2. **Creates Collections** (Albums, Clothing, Other) based on BigCartel categories
3. **Creates Size facet** with standard shirt sizes (Small, Medium, Large, etc.)
4. **Downloads and creates Assets** from BigCartel image URLs
5. **Creates Products** with:
   - Name, slug, description
   - Featured asset and additional images
   - Product variants (from BigCartel options)
   - Product option groups (Size, Style, etc.)
   - Size facets (for clothing products only)
   - Pricing (converted from dollars to cents)
   - Stock levels (0 for sold-out items, 100 for active)
6. **Note:** Products need to be manually assigned to collections in the Admin UI (Vendure API limitation)

### Notes

- Images are downloaded from BigCartel URLs automatically
- Prices are converted from dollars to cents (Vendure uses cents)
- Sold-out products are imported but with 0 stock
- The script includes delays to avoid rate limiting
- Collections are created automatically (Albums, Clothing, Other)
- Size facets are automatically assigned to clothing products
- Products must be manually assigned to collections in the Admin UI after import

### Troubleshooting

**Authentication fails:**
- Check that `SUPERADMIN_USERNAME` and `SUPERADMIN_PASSWORD` are correct
- Ensure the Vendure server is running

**Asset creation fails:**
- Check that image URLs are accessible
- Some images may fail to download - the script will continue

**Product creation fails:**
- Check the console output for specific error messages
- Some products may fail due to validation errors

