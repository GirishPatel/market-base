# 🚀 Local Development Guide

## 🚀 Quick Start (Automated Setup for New Developers)

**NEW**: The entire application can now be started with a single command! No more manual database setup steps.

```bash
# One-command setup: builds, migrates, seeds, and starts everything
yarn docker:dev
```

This command automatically:
- ✅ Builds and starts all services (MySQL, Elasticsearch, backend, frontend)
- ✅ Runs database migrations
- ✅ Seeds the database with sample data
- ✅ Ensures proper startup order with health checks

**Access your app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs

### Additional Docker Commands

```bash
# Start services in background (production mode)
yarn docker:up

# View logs from all services
yarn docker:logs

# Stop all services  
yarn docker:down

# Clean reset (stops services, removes volumes, cleans Docker system)
yarn docker:clean

# Verify that setup is working correctly
yarn verify:setup
```

### Troubleshooting Automated Setup

**If startup fails:**
```bash
# Clean everything and try again
yarn docker:clean
yarn docker:dev
```

**To debug issues:**
```bash
# View detailed logs
yarn docker:logs

# View logs for specific service
docker compose logs -f backend
docker compose logs -f db
```

**Manual database operations (if needed):**
```bash
# Run migrations manually
docker compose exec backend npx prisma migrate deploy

# Run seeding manually
docker compose exec backend npm run db:seed
```

## 🛠️ Alternative: Local Development with Docker Services

This guide covers running database and Elasticsearch in Docker while running frontend and backend locally for faster development with hot reload.

## 📋 Prerequisites

- **Node.js 20+** 
- **Yarn** (project uses Yarn workspaces)
- **Docker & Docker Compose**

## 🛠️ Setup Steps

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd fullstack-monorepo
npm install  # Installs all dependencies for monorepo
```

> **Note**: The project uses `file:` references for internal packages which are compatible with all NPM versions.

### 2. Start Database Services Only

```bash
# Start only MySQL and Elasticsearch in Docker
docker compose up db elasticsearch -d
```

The `-d` flag runs them in detached mode (background).

**Verify services are running:**
```bash
docker compose ps
```

You should see:
- `db` (MySQL) on port 3306
- `elasticsearch` on ports 9200/9300

### 3. Setup Environment Files

The project now uses a centralized environment configuration that works for both local development and Docker.


**Environment files are automatically created:**
- ✅ **Root `.env`**: Main configuration (already created)
- ✅ **Backend `.env`**: Backend-specific variables (already created)  
- ✅ **Frontend `.env.local`**: Next.js variables (already created)

**How it works:**
- **Local development** (`yarn dev`): Uses individual `.env` files in each app
- **Docker Compose**: Uses root `.env` with container-specific overrides
- **Same variables, different hosts**: `localhost:3306` vs `db:3306` for database

### 4. Setup Database Schema

```bash
cd apps/backend

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

### 5. Start Services Locally

Open **3 separate terminals**:

**Terminal 1 - Backend (with hot reload):**
```bash
cd apps/backend
npm run dev
```
- Runs on http://localhost:3001
- Auto-restarts on file changes
- API docs at http://localhost:3001/api/docs

**Terminal 2 - Frontend (with hot reload):**
```bash
cd apps/frontend
npm run dev
```
- Runs on http://localhost:3000
- Hot reloads on file changes

**Terminal 3 - Shared Package (if modifying types):**
```bash
cd packages/shared
npm run dev  # Watches for type changes
```

## 🔄 Daily Development Workflow

### Starting Work
```bash
# 1. Start database services (if not running)
docker compose up db elasticsearch -d

# 2. Start backend
cd apps/backend && npm run dev

# 3. Start frontend (new terminal)
cd apps/frontend && npm run dev
```

### During Development
- ✅ **Code changes** trigger automatic reloads
- ✅ **Database persists** between restarts
- ✅ **Fast feedback loop** without Docker rebuild delays

### Stopping Work
```bash
# Stop local services: Ctrl+C in each terminal

# Stop Docker services
docker compose down

# Or keep DB running for next session
docker compose stop
```

## 🧪 Testing Locally

```bash
# Run all tests
npm test

# Run specific service tests
cd apps/backend && npm test
cd apps/frontend && npm test

# Run with coverage
npm test -- --coverage
```

## 🔧 Database Operations

```bash
cd apps/backend

# View database in browser
npm run db:studio

# Reset database (destructive)
npm run db:reset

# Create new migration
npm run db:migrate

# Regenerate Prisma client after schema changes
npm run db:generate
```

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if MySQL is running
docker compose ps db

# Restart database
docker compose restart db

# Check logs
docker compose logs db
```

### Port Conflicts
If ports are already in use:

**Frontend (3000):**
```bash
# Change port temporarily
cd apps/frontend
PORT=3001 npm run dev
```

**Backend (3001):**
```bash
# Change port in apps/backend/.env
PORT=3002
```

### Clean Start
```bash
# Stop everything
docker compose down -v  # -v removes volumes

# Clean install
rm -rf node_modules package-lock.json
npm install

# Restart database and regenerate
docker compose up db elasticsearch -d
cd apps/backend
npm run db:generate
npm run db:migrate
npm run db:seed
```

## ⚡ Performance Tips

### Faster Builds
- Keep database containers running between sessions
- Use `npm run dev` (not `npm start`) for development
- Only rebuild shared package when changing types

### Memory Usage
- Elasticsearch uses 512MB by default
- MySQL uses minimal resources
- Monitor with `docker stats`

### Hot Reload
- Frontend: Changes reflect instantly
- Backend: Auto-restarts on file changes
- Shared types: Restart both services after changes

## 🔄 Switching Between Docker and Local

### From Local to Full Docker
```bash
# Stop local services (Ctrl+C)
docker compose down
docker compose up --build
```

### From Docker to Local
```bash
docker compose down
docker compose up db elasticsearch -d
# Then start services locally as above
```

## 📊 Monitoring

### Database
- **Prisma Studio**: http://localhost:5555 (after `npm run db:studio`)
- **Direct MySQL**: Connect to `localhost:3306`

### Elasticsearch
- **Health**: http://localhost:9200/_cat/health
- **Indices**: http://localhost:9200/_cat/indices

### Services
- **Backend Health**: http://localhost:3001/api/health
- **Backend Docs**: http://localhost:3001/api/docs
- **Frontend**: http://localhost:3000

---

This setup gives you the **best of both worlds**: production-like database/search services in Docker with fast development iteration for your application code! 🚀