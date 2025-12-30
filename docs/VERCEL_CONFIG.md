# Vercel Configuration

## Ignored Build Step (Recommended)

Similar to Railway's "Watch Paths", Vercel has an "Ignored Build Step" feature that prevents deployments when only non-frontend files change.

### Setup:

1. Go to Vercel Dashboard → Your Project → **Settings** → **Git**
2. Find **Ignored Build Step**
3. Enter this command:
   ```bash
   git diff HEAD^ HEAD --quiet -- frontend/
   ```
4. Click **Save**

**How it works:**
- If `frontend/` has changes → command exits with code 1 → build proceeds
- If only `backend/`, `docs/`, or root files changed → command exits with code 0 → build is skipped

### Alternative: Root Directory Setting

You can also set the root directory to `frontend/`:

1. Go to **Settings** → **General** → **Root Directory**
2. Set it to: `frontend`
3. Click **Save**

This makes Vercel only look at the `frontend/` directory by default.

## Current Configuration

The `frontend/vercel.json` file is configured with:
- Build Command: `npm run build`
- Output Directory: `.next`
- Framework: `nextjs`

## Verification

After configuration:
- Push a change to `docs/` → Vercel should skip deployment
- Push a change to `backend/` → Vercel should skip deployment  
- Push a change to `frontend/` → Vercel should deploy

