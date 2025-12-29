# Shop Short Fuse Music

E-commerce shop for Short Fuse Music built with Vendure (backend) and Next.js (storefront).

## Project Structure

```
shop-shortfusemusic/
├── backend/          # Vendure server (port 3000)
├── frontend/         # Next.js storefront (port 3001)
├── docker-compose.yml # Local development with PostgreSQL
└── package.json      # Root package.json for local dev scripts
```

## Services

- **Backend**: Vendure server running on port 3000
  - Admin UI: `http://localhost:3000/admin`
  - Shop API: `http://localhost:3000/shop-api`
  - Admin API: `http://localhost:3000/admin-api`
- **Frontend**: Next.js storefront running on port 3001
  - Storefront: `http://localhost:3001`

## Local Development

### Prerequisites

- Node.js 18+ or 20+
- Docker and Docker Compose (for PostgreSQL)
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   - Copy `backend/.env.example` to `backend/.env` and configure
   - Copy `frontend/.env.example` to `frontend/.env` and configure

3. **Start PostgreSQL (using Docker Compose):**
   ```bash
   docker-compose up -d postgres_db
   ```

4. **Run both services:**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend on `http://localhost:3000`
   - Frontend on `http://localhost:3001`

### Individual Service Commands

**Backend only:**
```bash
cd backend
npm run dev
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

## Production Deployment

### Architecture

- **Frontend**: Deployed to [Vercel](https://vercel.com) (free tier)
- **Backend**: Deployed to [Railway](https://railway.app) (free tier: 500 hours/month)
- **Database**: Railway managed PostgreSQL (included)
- **Cost**: $0-7/month (likely $0 with low traffic)

### DNS Configuration

- `shop.shortfusemusic.com` → Vercel (frontend)
- `admin.shortfusemusic.com` → Railway (backend)

### Deployment Steps

#### Frontend (Vercel)

1. Connect GitHub repo to Vercel
2. Set root directory to `frontend/`
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. Add environment variable:
   - `NEXT_PUBLIC_HOST=https://admin.shortfusemusic.com`
5. Add custom domain: `shop.shortfusemusic.com`

#### Backend (Railway)

1. Connect GitHub repo to Railway
2. Create new service, set root directory to `backend/`
3. Railway will auto-detect Dockerfile and deploy
4. Add PostgreSQL database service (Railway managed)
5. Configure environment variables:
   - Database connection (auto-provided by Railway via `DATABASE_URL`)
   - `COOKIE_SECRET` (generate a secure random string)
   - `SUPERADMIN_USERNAME` and `SUPERADMIN_PASSWORD`
   - `ASSET_UPLOAD_DIR=/app/static/assets`
   - `PORT=3000`
   - `APP_ENV=production`
6. Add custom domain: `admin.shortfusemusic.com`

### Environment Variables

**Backend (Railway):**
- `APP_ENV=production`
- `PORT=3000`
- `DATABASE_URL` (auto-provided by Railway)
- `COOKIE_SECRET` (your secret key)
- `SUPERADMIN_USERNAME` (admin username)
- `SUPERADMIN_PASSWORD` (admin password)
- `ASSET_UPLOAD_DIR=/app/static/assets`
- `FROM_EMAIL_ADDRESS="Short Fuse Music" <noreply@shortfusemusic.com>`

**Frontend (Vercel):**
- `NEXT_PUBLIC_HOST=https://admin.shortfusemusic.com`

## Database Migrations

Database migrations run automatically when the backend starts. Migrations are located in `backend/migrations/`.

To generate a new migration:
```bash
cd backend
npx vendure migrate
```

## Local Kubernetes Learning (Optional)

A `k8s-local/` directory can be added later for learning Kubernetes concepts locally. This is for educational purposes only, not for production deployment.

## Useful Links

- [Vendure Documentation](https://www.vendure.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)

## License

Private project for Short Fuse Music.

