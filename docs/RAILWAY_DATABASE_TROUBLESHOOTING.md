# Railway Database Connection Troubleshooting

## Current Error

The backend is trying to connect to `127.0.0.1:5432` (localhost), which means `DATABASE_URL` is not set in Railway.

## Quick Fix Checklist

### ✅ Step 1: Add PostgreSQL Database Service

1. In Railway project dashboard, click **+ New**
2. Select **Database** → **Add PostgreSQL**
3. Wait for Railway to provision the database (takes 1-2 minutes)

### ✅ Step 2: Link DATABASE_URL to Backend Service

**Option A: Automatic (Recommended)**
- Railway should automatically link `DATABASE_URL` when you add a PostgreSQL service
- Check your backend service's **Variables** tab
- You should see `DATABASE_URL` listed

**Option B: Manual Link**
1. Go to your backend service
2. Click **Variables** tab
3. Click **+ New Variable** → **Reference Variable**
4. Select your PostgreSQL service
5. Select `DATABASE_URL` from the dropdown
6. Click **Add**

### ✅ Step 3: Verify DATABASE_URL Format

The `DATABASE_URL` should look like:
```
postgresql://postgres:password@hostname.railway.internal:5432/railway
```

Or for public access:
```
postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
```

### ✅ Step 4: Check Logs

After redeploying, check Railway logs. You should see:
```
[DB Config] Using DATABASE_URL for connection
```

If you see:
```
[DB Config] DATABASE_URL not found, using individual env vars
```

Then `DATABASE_URL` is still not set.

## Common Issues

### Issue: "DATABASE_URL not found" in logs

**Solution:**
1. Verify PostgreSQL service exists in Railway
2. Check backend service **Variables** tab for `DATABASE_URL`
3. If missing, manually link it (see Step 2, Option B)
4. Redeploy the backend service

### Issue: Still connecting to localhost

**Solution:**
1. Check Railway logs for `[DB Config]` messages
2. Verify `DATABASE_URL` is in the Variables tab
3. Make sure you've pushed the latest code (with DATABASE_URL support)
4. Force a redeploy in Railway

### Issue: Database service not showing in Railway

**Solution:**
1. Make sure you're in the correct Railway project
2. Check that PostgreSQL service was successfully created
3. Try creating a new PostgreSQL service if the first one failed

## Verification Steps

1. ✅ PostgreSQL service exists in Railway
2. ✅ Backend service has `DATABASE_URL` in Variables tab
3. ✅ Latest code is deployed (check git commits)
4. ✅ Logs show `[DB Config] Using DATABASE_URL for connection`
5. ✅ No more `ECONNREFUSED` errors

## Next Steps After Database Connects

Once the database connection works:
1. Database migrations will run automatically
2. Service should start successfully
3. You can access admin UI at your Railway domain + `/admin`

