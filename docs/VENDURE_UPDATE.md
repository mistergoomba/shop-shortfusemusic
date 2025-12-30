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

- **TypeScript Type Checking**: Passed  
- **Build**: Successful  
- **No Breaking Changes Detected**: Code compiles without errors

## Database Migrations

The project is configured with:
- `synchronize: false` in production (uses migrations)
- `synchronize: true` in development (auto-syncs schema)
- Migrations path: `./src/migrations/*.+(js|ts)`

**For Production:**
- Migrations run automatically when the server starts
- Always backup your database before running migrations

**For Development:**
- With `synchronize: true`, the schema will auto-update on server start
- No manual migration needed

## Notes

- Apollo Server v4 is deprecated (will EOL Jan 26, 2026) - consider upgrading to v5 in the future
- The update includes security patches. Review the [Vendure Changelog](https://github.com/vendure-ecommerce/vendure/releases) for details

## Changelog References

For detailed changes, see:
- [Vendure GitHub Releases](https://github.com/vendure-ecommerce/vendure/releases)
- [Vendure Documentation - Updating Guide](https://docs.vendure.io/guides/developer-guide/updating/)

## Rollback Plan

If issues arise, you can rollback by:
1. Reverting `package.json` to previous versions
2. Running `npm install`
3. Restoring database from backup (if migrations were applied)

