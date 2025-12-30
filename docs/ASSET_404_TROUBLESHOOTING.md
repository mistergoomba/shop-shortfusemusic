# Asset 404 Troubleshooting Guide

## Problem: Assets Return 404 Not Found

When assets are uploaded through the Vendure admin panel, they appear in the database but return 404 errors when accessed from the frontend.

**Common Symptoms:**
- Assets appear in the admin assets listing page (`/admin/catalog/assets`)
- Assets show as broken/missing when assigned to products (`/admin/catalog/products/:id`)
- Asset URLs return 404 when accessed directly
- Assets work initially but break after a Railway redeployment

**Example Error:**
```
GET https://admin.shortfusemusic.com/assets/preview/6b/hate-1__preview.webp?w=800&h=800&mode=resize&format=webp
Status: 404 Not Found
```

**Why This Happens:**
- Vendure stores asset metadata (name, size, URL) in the database
- The actual image files are stored on the filesystem
- Railway's filesystem is ephemeral - files are lost on redeploy
- Database records remain, but the files are gone → broken links

## Root Cause

Railway's container filesystem is **ephemeral**. This means:
- Files uploaded to the container are stored in the container's filesystem
- When the container restarts or redeploys, all files are lost
- The database still has references to these assets, but the actual files don't exist
- This causes 404 errors when trying to access the assets

## Solution: Use Railway Persistent Volume

### Step 1: Create a Volume in Railway

1. Go to your Railway project dashboard
2. Click **+ New**
3. Select **Volume** → **Add Volume**
4. Name it `assets` (or any name you prefer)
5. Click **Create**

### Step 2: Mount the Volume to Your Backend Service

1. Click on your backend service
2. Go to **Settings** tab
3. Scroll down to **Volumes** section
4. Click **+ Mount Volume**
5. Select the volume you created (e.g., `assets`)
6. Set the mount path to: `/data`
7. Click **Mount**

### Step 3: Update Environment Variable

1. In your backend service, go to **Variables** tab
2. Add or update the `ASSET_UPLOAD_DIR` variable:
   - Name: `ASSET_UPLOAD_DIR`
   - Value: `/data/assets`
3. Save the variable

### Step 4: Redeploy

1. Railway will automatically redeploy your service when you mount the volume
2. Wait for the deployment to complete
3. Check the logs to ensure the service started successfully

### Step 5: Clean Up and Re-upload Assets

**Important:** The existing asset records in the database point to files that no longer exist. You have two options:

**Option A: Delete Broken Assets and Re-upload (Recommended)**
1. Go to `https://admin.shortfusemusic.com/admin/catalog/assets`
2. Delete the broken asset records (they show in the list but files are missing)
3. Re-upload the assets through the admin panel
4. Re-assign them to your products
5. The new assets will now persist across deployments

**Option B: Keep Records and Re-upload with Same Names**
1. Note the exact filenames of your broken assets
2. Re-upload assets with the same filenames
3. The database records will now point to the new files
4. This preserves product-asset relationships

**After re-uploading:**
- Assets will persist across Railway deployments
- Product pages will show images correctly
- Frontend will load assets without 404 errors

## Verification

After setting up the volume:

1. **Check Volume Mount:**
   - Go to **Settings** → **Volumes** in your backend service
   - Verify the volume is mounted at `/data`

2. **Check Environment Variable:**
   - Go to **Variables** tab
   - Verify `ASSET_UPLOAD_DIR=/data/assets` is set

3. **Test Asset Upload:**
   - Upload a test image through the admin panel
   - Check that the asset URL works: `https://admin.shortfusemusic.com/assets/...`
   - Redeploy the service
   - Verify the asset still works after redeployment

## Alternative Solutions

If you prefer not to use Railway volumes, consider:

1. **Cloud Storage (S3, Cloudinary, etc.)**
   - Requires configuring Vendure to use external storage
   - More complex setup but more scalable
   - Better for high-traffic sites

2. **CDN with External Storage**
   - Use a service like Cloudinary or ImageKit
   - Assets are stored externally and served via CDN
   - Requires additional configuration

## Prevention

To prevent this issue in the future:
- Always set up a persistent volume before uploading assets
- Document the volume setup in your deployment checklist
- Consider using external storage for production environments

## Related Documentation

- [Railway Setup Guide](./RAILWAY_SETUP.md)
- [Railway Environment Variables](./RAILWAY_ENV_VARS.md)
- [Railway Volumes Documentation](https://docs.railway.app/reference/volumes)

