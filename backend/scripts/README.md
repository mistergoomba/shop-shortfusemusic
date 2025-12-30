# Import Scripts

## BigCartel Import

Import products from BigCartel JSON export into Vendure.

### Usage

```bash
npm run import:bigcartel <path-to-products.json>
```

### Example

```bash
npm run import:bigcartel "/Users/mistergoomba/Dropbox/current projects/new shop/products.json"
```

Or using ts-node directly:

```bash
ts-node scripts/import-bigcartel.ts "/path/to/products.json"
```

### Prerequisites

1. **Vendure server must be running** (local or production)
2. **Environment variables** (from `.env`):
   - `ADMIN_API_URL` (default: `http://localhost:3000/admin-api`)
   - `SUPERADMIN_USERNAME` (default: `superadmin`)
   - `SUPERADMIN_PASSWORD` (default: `superadmin`)

### What it does

1. **Authenticates** with Vendure Admin API
2. **Creates Collections** from BigCartel categories
3. **Downloads and creates Assets** from BigCartel image URLs
4. **Creates Products** with:
   - Name, slug, description
   - Featured asset and additional images
   - Product variants (from BigCartel options)
   - Product option groups (Size, Style, etc.)
   - Pricing (converted from dollars to cents)
   - Stock levels (0 for sold-out items, 100 for active)
5. **Associates products** with collections

### Notes

- Images are downloaded from BigCartel URLs automatically
- Prices are converted from dollars to cents (Vendure uses cents)
- Sold-out products are imported but with 0 stock
- The script includes delays to avoid rate limiting
- If a collection already exists, it will be reused

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

