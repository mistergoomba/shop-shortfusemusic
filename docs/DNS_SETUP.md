# DNS Setup Guide

## Current Setup

- **Domain Registrar**: Squarespace (using custom nameservers)
- **DNS Provider**: Vercel (managing DNS records)
- **Frontend**: Vercel (`shortfusemusic.com` and `www.shortfusemusic.com`)
- **Backend**: Railway (needs `admin.shortfusemusic.com`)

## Setting Up `admin.shortfusemusic.com` for Railway

### Step 1: Get Railway Domain

1. Go to your Railway project dashboard
2. Click on your backend service
3. Go to the **Settings** tab
4. Scroll to **Networking** section
5. You'll see a **Public Domain** - this is Railway's auto-generated domain (e.g., `your-app.up.railway.app`)
6. **Copy this domain** - you'll need it for the CNAME record

### Step 2: Add Custom Domain in Railway

1. In Railway, go to your service **Settings** → **Networking**
2. Under **Custom Domain**, click **Add Custom Domain**
3. Enter: `admin.shortfusemusic.com`
4. Railway will show you the DNS records needed (usually a CNAME pointing to their domain)

### Step 3: Add CNAME Record in Vercel

Since Vercel is managing your DNS:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (the one with `shortfusemusic.com`)
3. Go to **Settings** → **Domains**
4. Click on `shortfusemusic.com`
5. Click **DNS Records** tab
6. Click **Add Record**
7. Configure:
   - **Name**: `admin`
   - **Type**: `CNAME`
   - **Value**: `[Railway's domain from Step 1]` (e.g., `your-app.up.railway.app`)
   - **TTL**: `60` (or leave default)
8. Click **Save**

### Step 4: Wait for DNS Propagation

- DNS changes can take 5-60 minutes to propagate
- Railway will automatically provision SSL certificate for `admin.shortfusemusic.com`
- You can check DNS propagation status using tools like:
  - `dig admin.shortfusemusic.com`
  - [whatsmydns.net](https://www.whatsmydns.net/#CNAME/admin.shortfusemusic.com)

### Step 5: Verify Railway Configuration

Once DNS propagates:

1. Railway should show the domain as "Active" in the Networking section
2. SSL certificate should be automatically issued
3. Test by visiting: `https://admin.shortfusemusic.com/admin`
4. You should see the Vendure Admin UI

## Important Notes

### Email Records (Don't Touch!)

**DO NOT modify these records** - they're needed for email:

- `@` MX record → `mx3.zoho.com.`
- `@` TXT record → `v=spf1 include:zoho.com ~all`
- `shortfusemusic._domainkey` TXT record → (DKIM key)

### Existing Records to Keep

- `shortfusemusic._domainkey` (TXT) - DKIM for email
- `@` (TXT) - SPF record for email
- `@` (MX) - Mail server
- `@` (A) - Points to Vercel (for root domain)

### What We're Adding

- `admin` (CNAME) → Railway domain (NEW - for backend)

## Troubleshooting

### Domain Not Resolving

1. Check DNS propagation: `dig admin.shortfusemusic.com`
2. Verify CNAME record in Vercel DNS settings
3. Check Railway shows domain as "Active"
4. Wait up to 60 minutes for full propagation

### SSL Certificate Issues

- Railway automatically provisions SSL certificates
- If certificate fails, check that:
  - DNS is fully propagated
  - Domain is correctly configured in Railway
  - Railway service is running

### Can't Access Admin UI

- Verify Railway service is running
- Check Railway logs for errors
- Ensure `admin.shortfusemusic.com/admin` (not just root)
- Check Vendure config has correct `assetUrlPrefix` set
