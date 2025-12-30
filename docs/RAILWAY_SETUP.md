# Railway Backend Setup Guide

## Overview

Railway provides a `DATABASE_URL` environment variable automatically when you add a PostgreSQL service. The code supports both `DATABASE_URL` and individual database variables.

## Setup Steps

### 1. Add PostgreSQL Database Service

1. In your Railway project, click **+ New**
2. Select **Database** → **Add PostgreSQL**
3. Railway will automatically create a PostgreSQL database
4. Railway will automatically provide a `DATABASE_URL` environment variable to your backend service

### 2. Link Database to Backend Service

1. Click on your backend service
2. Go to **Variables** tab
3. You should see `DATABASE_URL` automatically added (Railway does this when you add a database)
4. If not visible, click **Reference Variable** and select the PostgreSQL service's `DATABASE_URL`

### 3. Set Required Environment Variables

In your backend service's **Variables** tab, add these environment variables:

**Required:**
- `APP_ENV=production`
- `PORT=3000`
- `COOKIE_SECRET` - Generate a secure random string (e.g., use `openssl rand -base64 32`)
- `SUPERADMIN_USERNAME` - Your admin username (e.g., `admin`)
- `SUPERADMIN_PASSWORD` - Your admin password (use a strong password!)

**Optional (with defaults):**
- `ASSET_UPLOAD_DIR=/app/static/assets` - Where uploaded assets are stored
- `FROM_EMAIL_ADDRESS="Short Fuse Music" <noreply@shortfusemusic.com>` - Email sender address
- `DB_SCHEMA=public` - Database schema (defaults to `public` if not set)

### 4. Verify Database Connection

After setting up the database and environment variables:

1. Railway will automatically redeploy your service
2. Check the **Deployments** tab for logs
3. You should see successful database connection messages
4. The service should start without `ECONNREFUSED` errors

### 5. Access the Admin UI

Once the service is running:

1. Go to your Railway service's **Settings** → **Networking**
2. Find your public domain (e.g., `your-app.up.railway.app`)
3. Visit: `https://your-app.up.railway.app/admin`
4. You should see the Vendure Admin UI login page

## Environment Variables Summary

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ | Auto-provided by Railway | `postgresql://user:pass@host:port/db` |
| `APP_ENV` | ✅ | Environment mode | `production` |
| `PORT` | ✅ | Server port | `3000` |
| `COOKIE_SECRET` | ✅ | Secret for cookies | `[random string]` |
| `SUPERADMIN_USERNAME` | ✅ | Admin login username | `admin` |
| `SUPERADMIN_PASSWORD` | ✅ | Admin login password | `[strong password]` |
| `ASSET_UPLOAD_DIR` | ❌ | Asset storage path | `/app/static/assets` |
| `FROM_EMAIL_ADDRESS` | ❌ | Email sender | `"Short Fuse Music" <noreply@shortfusemusic.com>` |
| `DB_SCHEMA` | ❌ | Database schema | `public` |

## Troubleshooting

### "ECONNREFUSED" Error

**Problem**: Backend can't connect to database

**Solutions**:
1. Verify PostgreSQL service is running in Railway
2. Check that `DATABASE_URL` is set in backend service variables
3. Ensure database service is linked to backend service
4. Wait a few minutes after creating database (Railway needs time to provision)

### Database Migrations

Database migrations run automatically when the backend starts. If migrations fail:

1. Check Railway logs for migration errors
2. Verify database has proper permissions
3. Ensure `synchronize: true` is set (for initial setup, disable in production later)

### Service Keeps Restarting

If the service keeps crashing:

1. Check **Deployments** → **Logs** for error messages
2. Verify all required environment variables are set
3. Check that `PORT=3000` matches the port in Railway networking settings
4. Ensure database is fully provisioned and running
