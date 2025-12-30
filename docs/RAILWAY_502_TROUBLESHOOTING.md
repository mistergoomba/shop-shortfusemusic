# Railway 502 Error Troubleshooting

## Current Situation

- ✅ Database is connected (`[DB Config] Using DATABASE_URL for connection`)
- ✅ Migrations are running
- ❌ Getting 502 error on `https://admin.shortfusemusic.com/`

## Possible Causes

### 1. Service Still Starting Up

Migrations can take 1-2 minutes. The service might not be ready yet.

**Check:**
- Look at Railway logs - do you see "Vendure server is ready" or similar?
- Wait 2-3 minutes after deployment and try again

### 2. Service Crashed After Migrations

The server might be crashing after migrations complete.

**Check Railway Logs For:**
- Any error messages after migrations finish
- "Bootstrap" or "server ready" messages
- Any stack traces or exceptions

### 3. Port Configuration Mismatch

Railway custom domain might be configured for wrong port.

**Verify:**
1. Railway → Backend Service → Settings → Networking
2. Custom Domain `admin.shortfusemusic.com` should show port `3000`
3. Backend code listens on `0.0.0.0:3000` (correct)

### 4. Service Not Listening

The service might not be binding to the correct interface.

**Verify in Code:**
- `vendure-config.ts` has `hostname: '0.0.0.0'` ✅ (correct)
- `port: serverPort` where `serverPort = +process.env.PORT || 3000` ✅ (correct)

## Debugging Steps

### Step 1: Check if Service is Running

In Railway logs, look for:
```
[Vendure] Server is ready
```
or
```
Application is running on: http://0.0.0.0:3000
```

If you don't see this, the server hasn't fully started.

### Step 2: Check Railway Service Status

1. Go to Railway → Your Backend Service
2. Check the **Deployments** tab
3. Is the latest deployment "Active" (green)?
4. Or is it "Building" or "Failed"?

### Step 3: Check Custom Domain Configuration

1. Railway → Backend Service → Settings → Networking
2. Under **Custom Domain**, verify:
   - `admin.shortfusemusic.com` is listed
   - Status shows "Active" (not "Pending" or "Failed")
   - Port is set to `3000`

### Step 4: Test Railway's Public Domain

1. Railway → Backend Service → Settings → Networking
2. Find the **Public Domain** (e.g., `your-app.up.railway.app`)
3. Try accessing: `https://your-app.up.railway.app/admin`
4. If this works but custom domain doesn't → DNS issue
5. If this also gives 502 → Service issue

### Step 5: Check Recent Logs

Look for these patterns in logs:

**Good signs:**
- `[DB Config] Using DATABASE_URL for connection` ✅
- Migrations completing successfully
- `[Vendure Worker] Bootstrapping Vendure Worker` ✅
- Server bootstrap messages

**Bad signs:**
- Errors after migrations
- "Cannot find module" errors
- Port binding errors
- Service exiting/crashing

## Common Fixes

### Fix 1: Wait for Migrations to Complete

If migrations are still running, wait 2-3 minutes and refresh.

### Fix 2: Check Environment Variables

Verify these are set in Railway:
- `PORT=3000` (must match Railway custom domain port)
- `APP_ENV=production`
- `DATABASE_URL` (linked from PostgreSQL service)
- `COOKIE_SECRET`
- `SUPERADMIN_USERNAME`
- `SUPERADMIN_PASSWORD`

### Fix 3: Force Redeploy

1. Railway → Backend Service → Deployments
2. Click **Redeploy** on latest deployment
3. Watch logs for any errors

### Fix 4: Check DNS Propagation

If Railway's public domain works but custom domain doesn't:

1. Check DNS: `dig admin.shortfusemusic.com`
2. Should resolve to Railway's domain
3. If not, DNS hasn't propagated yet (wait 5-60 minutes)

## What to Look For in Logs

After migrations complete, you should see:

```
[Vendure] Bootstrapping Vendure Server...
[Vendure] Server is ready
```

Or similar bootstrap messages indicating the server started successfully.

If you see errors instead, that's the problem to fix.

## Next Steps

1. ✅ Check Railway logs for server startup messages
2. ✅ Verify port configuration matches (3000)
3. ✅ Test Railway's public domain (not custom domain)
4. ✅ Check if service status is "Active"
5. ✅ Wait for migrations to complete if still running

