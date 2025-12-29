# Pre-Deployment Checklist

Run these commands before deploying to ensure everything is working:

## Quick Validation (Recommended)

From the root directory:
```bash
npm run validate
```

This will:
- ✅ Check TypeScript types in both backend and frontend
- ✅ Run ESLint on frontend (warnings won't fail)
- ✅ Verify backend builds successfully

## Individual Service Validation

**Backend:**
```bash
cd backend
npm run validate
# or individually:
npm run type-check
npm run build
```

**Frontend:**
```bash
cd frontend
npm run validate
# or individually:
npm run type-check
npm run lint
npm run format:check  # Optional - checks formatting
```

## Strict Validation (Includes Formatting)

```bash
npm run validate:strict
```

This also checks Prettier formatting (will fail if code isn't formatted).

## Before Deploying

1. ✅ Run `npm run validate` from root
2. ✅ Ensure all TypeScript errors are fixed
3. ✅ Push to GitHub
4. ✅ Verify Railway backend deploys successfully
5. ✅ Verify Vercel frontend deploys successfully
6. ✅ Update `NEXT_PUBLIC_HOST` in Vercel with Railway backend URL

## Common Issues

- **TypeScript errors**: Run `npm run type-check` in the failing service
- **Formatting issues**: Run `npm run format` in frontend to auto-fix
- **Build failures**: Check that all dependencies are installed

