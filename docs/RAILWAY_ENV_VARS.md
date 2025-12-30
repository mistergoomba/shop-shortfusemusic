# Railway Environment Variables Setup

## Required Environment Variables

Your backend service is crashing because these required environment variables are missing:

### 1. COOKIE_SECRET (Required)

**Error**: `Error: .keys required.`

**How to generate:**
```bash
openssl rand -base64 32
```

**Or use an online generator:**
- Generate a random 32+ character string
- Example: `aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1pQ3`

**In Railway:**
1. Backend Service → **Variables** tab
2. Click **+ New Variable**
3. Name: `COOKIE_SECRET`
4. Value: `[paste your generated secret]`
5. Click **Add**

### 2. SUPERADMIN_USERNAME (Required)

**Error**: `Cannot read properties of undefined (reading 'length')`

**Value**: Your admin login username (e.g., `admin`)

**In Railway:**
1. Backend Service → **Variables** tab
2. Click **+ New Variable**
3. Name: `SUPERADMIN_USERNAME`
4. Value: `admin` (or your preferred username)
5. Click **Add**

### 3. SUPERADMIN_PASSWORD (Required)

**Error**: `Cannot read properties of undefined (reading 'length')`

**Value**: Your admin login password (use a strong password!)

**In Railway:**
1. Backend Service → **Variables** tab
2. Click **+ New Variable**
3. Name: `SUPERADMIN_PASSWORD`
4. Value: `[your strong password]`
5. Click **Add**

## Complete Environment Variables List

### Required (Must Set)

| Variable | Description | Example |
|----------|-------------|---------|
| `COOKIE_SECRET` | Secret key for cookies (generate random) | `aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1pQ3` |
| `SUPERADMIN_USERNAME` | Admin login username | `admin` |
| `SUPERADMIN_PASSWORD` | Admin login password | `[strong password]` |
| `APP_ENV` | Environment mode | `production` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | Database connection (auto-provided by Railway) | `postgresql://...` |

### Optional (Have Defaults)

| Variable | Description | Default |
|----------|-------------|---------|
| `ASSET_UPLOAD_DIR` | Asset storage path | `/app/static/assets` |
| `FROM_EMAIL_ADDRESS` | Email sender | `"Short Fuse Music" <noreply@shortfusemusic.com>` |
| `DB_SCHEMA` | Database schema | `public` |

## Quick Setup Checklist

- [ ] `COOKIE_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `SUPERADMIN_USERNAME` - Set to your admin username
- [ ] `SUPERADMIN_PASSWORD` - Set to a strong password
- [ ] `APP_ENV=production`
- [ ] `PORT=3000`
- [ ] `DATABASE_URL` - Should be auto-linked from PostgreSQL service

## After Setting Variables

1. Railway will automatically redeploy your service
2. Check logs - you should see:
   - `[Server] Migrations completed, bootstrapping server...`
   - `[Server] Vendure server is ready!`
3. No more `.keys required` or `undefined` errors
4. Service should start successfully

## Security Notes

- **Never commit** `COOKIE_SECRET` or `SUPERADMIN_PASSWORD` to git
- Use Railway's environment variables (they're encrypted)
- Generate a new `COOKIE_SECRET` for production (don't reuse dev secrets)
- Use a strong password for `SUPERADMIN_PASSWORD`

