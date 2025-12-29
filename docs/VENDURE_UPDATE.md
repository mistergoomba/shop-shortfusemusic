# Vendure Update: 3.3.1 → 3.5.2

## Update Summary

Successfully updated all Vendure packages from version **3.3.1** to **3.5.2**.

### Updated Packages
- `@vendure/admin-ui-plugin`: 3.3.1 → 3.5.2
- `@vendure/asset-server-plugin`: 3.3.1 → 3.5.2
- `@vendure/core`: 3.3.1 → 3.5.2
- `@vendure/email-plugin`: 3.3.1 → 3.5.2
- `@vendure/graphiql-plugin`: 3.3.1 → 3.5.2
- `@vendure/cli`: 3.3.1 → 3.5.2

## Verification

✅ **TypeScript Type Checking**: Passed  
✅ **Build**: Successful  
✅ **No Breaking Changes Detected**: Code compiles without errors

## Next Steps

### 1. Database Migrations

When you run the updated Vendure server, it will automatically detect and apply any necessary database migrations. The project is configured with:

- `synchronize: true` - Auto-syncs schema in development (⚠️ **NOT recommended for production**)
- Migrations path: `./src/migrations/*.+(js|ts)`

**For Production:**
1. **Backup your database** before running migrations
2. Generate a migration script:
   ```bash
   npx vendure migrate
   ```
3. Review the generated migration file
4. Test the migration in a staging environment
5. Apply to production

**For Development:**
- With `synchronize: true`, the schema will auto-update on server start
- No manual migration needed

### 2. Test the Application

After updating, test the following:
- ✅ Admin UI loads correctly
- ✅ Shop API endpoints work
- ✅ GraphQL queries/mutations function properly
- ✅ Email functionality (if using)
- ✅ Asset uploads/downloads
- ✅ Custom plugins (if any)

### 3. Check for Deprecation Warnings

The update may include deprecation warnings for:
- Apollo Server v4 (deprecated, will EOL Jan 26, 2026) - consider upgrading to v5 in the future

### 4. Security Notes

The update includes security patches. Review the [Vendure Changelog](https://github.com/vendure-ecommerce/vendure/releases) for details on security fixes between 3.3.1 and 3.5.2.

## Changelog References

For detailed changes, see:
- [Vendure GitHub Releases](https://github.com/vendure-ecommerce/vendure/releases)
- [Vendure Documentation - Updating Guide](https://docs.vendure.io/guides/developer-guide/updating/)

## Rollback Plan

If issues arise, you can rollback by:
1. Reverting `package.json` to previous versions
2. Running `npm install`
3. Restoring database from backup (if migrations were applied)

