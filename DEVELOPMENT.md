# 🛠️ MarketBase Development Guide

This guide covers local development setup, testing, deployment, and getting help for developers working on the MarketBase e-commerce platform.

## 🚀 Quick Start (Automated Setup for New Developers)

### One-Command Setup

The entire application can be started with a single command! No more manual database setup steps.

```bash
# One-command setup: builds, migrates, seeds, and starts everything
yarn docker:dev
```

This command automatically:
- ✅ Builds and starts all services (MySQL, Elasticsearch, Kibana, backend, frontend)
- ✅ Runs database migrations
- ✅ Seeds the database with sample data
- ✅ Ensures proper startup order with health checks

**Access your app:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Docs: http://localhost:3001/api/docs
- Kibana: http://localhost:5601

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
docker compose logs -f elasticsearch
```

**Manual database operations (if needed):**
```bash
# Run migrations manually
docker compose exec backend npx prisma migrate deploy

# Run seeding manually
docker compose exec backend npm run db:seed

# Reset database completely
docker compose exec backend npm run db:reset
```

## 🛠️ Alternative: Local Development with Docker Services

This approach runs database services in Docker while running frontend and backend locally for faster development with hot reload.

### Prerequisites

- **Node.js 20+** 
- **Yarn** (project uses Yarn workspaces)
- **Docker & Docker Compose**

### Setup Steps

#### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd market-base
yarn install  # Installs all dependencies for monorepo
```

> **Note**: The project uses `file:` references for internal packages which are compatible with all NPM versions.

#### 2. Start Database Services Only

```bash
# Start only MySQL, Elasticsearch, and Kibana in Docker
docker compose up db elasticsearch kibana -d
```

The `-d` flag runs them in detached mode (background).

**Verify services are running:**
```bash
docker compose ps
```

You should see:
- `db` (MySQL) on port 3306
- `elasticsearch` on ports 9200/9300
- `kibana` on port 5601

#### 3. Setup Environment Files

The project uses centralized environment configuration that works for both local development and Docker.

**Environment files are automatically created:**
- ✅ **Root `.env`**: Main configuration (already created)
- ✅ **Backend `.env`**: Backend-specific variables (already created)  
- ✅ **Frontend `.env.local`**: Next.js variables (already created)

**How it works:**
- **Local development** (`yarn dev`): Uses individual `.env` files in each app
- **Docker Compose**: Uses root `.env` with container-specific overrides
- **Same variables, different hosts**: `localhost:3306` vs `db:3306` for database

#### 4. Setup Database Schema

```bash
cd apps/backend

# Generate Prisma client
yarn run db:generate

# Run database migrations
yarn run db:migrate

# Seed with sample data
yarn run db:seed
```

#### 5. Start Services Locally

Open **3 separate terminals**:

**Terminal 1 - Backend (with hot reload):**
```bash
cd apps/backend
yarn run dev
```
- Runs on http://localhost:3001
- Auto-restarts on file changes
- API docs at http://localhost:3001/api/docs

**Terminal 2 - Frontend (with hot reload):**
```bash
cd apps/frontend
yarn run dev
```
- Runs on http://localhost:3000
- Hot reloads on file changes

**Terminal 3 - Shared Package (if modifying types):**
```bash
cd packages/shared
yarn run dev  # Watches for type changes
```

## 🔄 Daily Development Workflow

### Starting Work
```bash
# 1. Start database services (if not running)
docker compose up db elasticsearch kibana -d

# 2. Start backend
cd apps/backend && yarn run dev

# 3. Start frontend (new terminal)
cd apps/frontend && yarn run dev
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

## 📝 Available Commands

### Root Level Commands

```bash
yarn run dev           # Start all apps in development mode
yarn run build         # Build all applications
yarn test              # Run all tests
yarn run lint          # Lint all code
yarn run lint:fix       # Fix auto-fixable linting issues
yarn run format        # Format all code
yarn run typecheck     # Type check all TypeScript
yarn run clean         # Clean all build artifacts

# Docker commands
yarn docker:dev         # Start with build and migrations (recommended)
yarn docker:up          # Start all services in background
yarn docker:down        # Stop all Docker services
yarn docker:logs        # View logs from all services
yarn docker:clean       # Clean reset (stops, removes volumes, cleans system)
yarn verify:setup       # Verify that setup is working correctly
```

### Backend Commands

```bash
cd apps/backend

yarn run dev           # Start in development mode
yarn run build         # Build for production
yarn start             # Start production server
yarn test              # Run tests
yarn run test:watch    # Run tests in watch mode

# Database commands
yarn run db:migrate    # Run database migrations
yarn run db:generate   # Generate Prisma client
yarn run db:seed       # Seed database with sample data
yarn run db:studio     # Open Prisma Studio (http://localhost:5555)
yarn run db:reset      # Reset database (destructive)
```

### Frontend Commands

```bash
cd apps/frontend

yarn run dev           # Start development server
yarn run build         # Build for production
yarn start             # Start production server
yarn test              # Run tests
yarn run test:watch    # Run tests in watch mode
```

## 🐳 Docker Usage

### Docker Build Behavior

**`docker compose up`:**
- ✅ **Automatically builds** images if they don't exist
- ✅ **Uses cached images** if no changes detected
- ✅ **Starts all services** (MySQL, Elasticsearch, Kibana, Backend, Frontend)

**`docker compose up --build`:**
- ✅ **Forces rebuild** of all images
- ✅ **Use this after code changes** for guaranteed fresh build

### Service Options

```bash
# Full stack (builds + runs everything)
docker compose up

# Force rebuild after code changes
docker compose up --build

# Database services only (for local development)
docker compose up db elasticsearch kibana -d

# Individual services
docker compose up db                                    # MySQL only
docker compose up db elasticsearch                     # DB + Search
docker compose up db elasticsearch kibana              # All infrastructure
docker compose up db elasticsearch kibana backend      # All except frontend
```

### Docker Management

```bash
# Stop all services
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v

# View running services
docker compose ps

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
docker compose logs -f elasticsearch
docker compose logs -f kibana
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn run test:watch

# Run tests with coverage
yarn test -- --coverage

# Test specific package
yarn workspace backend test
yarn workspace frontend test
yarn workspace shared test
```

### Test Structure

```bash
apps/backend/src/__tests__/     # Backend API tests
apps/frontend/src/__tests__/    # Frontend component tests
packages/shared/src/__tests__/  # Shared utility tests
```

### Writing Tests

**Backend Tests:**
- Use Jest + Supertest for API testing
- Test files: `*.test.ts` or `*.spec.ts`
- Mock external services (Elasticsearch, external APIs)

**Frontend Tests:**
- Use Jest + React Testing Library
- Test files: `*.test.tsx` or `*.spec.tsx`
- Focus on user interactions and component behavior

## 🔧 Database Operations

### Common Operations

```bash
cd apps/backend

# View database in browser UI
yarn run db:studio  # Opens Prisma Studio at http://localhost:5555

# Reset database (destructive - removes all data)
yarn run db:reset

# Create new migration after schema changes
npx prisma migrate dev --name your-migration-name

# Apply migrations to production database
npx prisma migrate deploy

# Regenerate Prisma client after schema changes
yarn run db:generate

# Seed database with sample data
yarn run db:seed
```

### Database Schema Changes

1. Edit `apps/backend/prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name your-change`
3. Update seed data if needed in `apps/backend/prisma/seed.ts`
4. Test migration: `yarn run db:reset && yarn run db:seed`

## 🔍 Development Monitoring

### Database Monitoring
- **Prisma Studio**: http://localhost:5555 (after `yarn run db:studio`)
- **Direct MySQL**: Connect to `localhost:3306` (root/password)
- **Query logs**: Check backend terminal output

### Elasticsearch Monitoring
- **Health Check**: http://localhost:9200/_cat/health
- **Indices**: http://localhost:9200/_cat/indices
- **Cluster Stats**: http://localhost:9200/_cluster/stats
- **Kibana Dashboard**: http://localhost:5601

### Application Monitoring
- **Backend Health**: http://localhost:3001/api/health
- **Backend API Docs**: http://localhost:3001/api/docs
- **Frontend**: http://localhost:3000
- **Application Logs**: Check terminal outputs

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if MySQL is running
docker compose ps db

# Restart database
docker compose restart db

# Check database logs
docker compose logs db

# Connect to database directly
docker compose exec db mysql -u root -p
```

### Elasticsearch Issues
```bash
# Check Elasticsearch health
curl http://localhost:9200/_cat/health

# Restart Elasticsearch
docker compose restart elasticsearch

# Check Elasticsearch logs
docker compose logs elasticsearch

# Clear Elasticsearch data
docker compose down -v
docker compose up elasticsearch -d
```

### Port Conflicts
If ports are already in use:

**Frontend (3000):**
```bash
# Change port temporarily
cd apps/frontend
PORT=3001 yarn run dev
```

**Backend (3001):**
```bash
# Change port in apps/backend/.env
PORT=3002
```

**Database (3306):**
```bash
# Change port mapping in docker-compose.yml
ports:
  - "3307:3306"  # External:Internal
```

### Clean Development Reset
```bash
# Stop everything and clean up
docker compose down -v  # -v removes volumes
yarn docker:clean       # Clean Docker system

# Clean install dependencies
rm -rf node_modules yarn.lock
yarn install

# Restart with fresh data
yarn docker:dev
```

## ⚡ Performance Tips

### Faster Development
- Keep database containers running between sessions
- Use `yarn run dev` (not `yarn start`) for development
- Only rebuild shared package when changing types
- Use Docker layer caching for faster builds

### Memory Usage
- Elasticsearch uses 512MB by default (configurable in docker-compose.yml)
- MySQL uses minimal resources
- Monitor with `docker stats`

### Hot Reload Optimization
- Frontend: Changes reflect instantly
- Backend: Auto-restarts on file changes
- Shared types: Restart both services after changes
- Database: Persists between service restarts

## 🔄 Switching Between Development Modes

### From Local to Full Docker
```bash
# Stop local services (Ctrl+C in terminals)
docker compose down
docker compose up --build
```

### From Docker to Local Development
```bash
docker compose down
docker compose up db elasticsearch kibana -d
# Then start backend and frontend locally as described above
```

## 🚀 Deployment

### Docker Production Deployment

```bash
# Build and start all services for production
docker compose up --build -d

# View production logs
docker compose logs -f

# Stop production services
docker compose down
```

### Individual Service Deployment

**Backend Deployment:**
- Can be deployed to any Node.js hosting service (AWS, Google Cloud, etc.)
- Requires MySQL and Elasticsearch connections
- Set environment variables for production database/search URLs
- Use `yarn build && yarn start` for production builds

**Frontend Deployment:**
- Can be deployed to Vercel, Netlify, or any static hosting service
- Configure `NEXT_PUBLIC_API_BASE_URL` to point to production backend
- Use `yarn build && yarn start` for production builds

### Environment Configuration

Create production environment files:
- `.env.production` (root level)
- `apps/backend/.env.production`
- `apps/frontend/.env.production`

## 🔧 Code Quality & Development Standards

### Pre-commit Hooks

The project automatically runs the following before each commit:
```bash
lint-staged  # Lint and format staged files
commitlint   # Validate commit message format (conventional commits)
```

### Manual Quality Checks

```bash
yarn run lint       # Check for linting issues across all packages
yarn run lint:fix   # Fix auto-fixable linting issues
yarn run format     # Format all code with Prettier
yarn run typecheck  # Run TypeScript checks across all packages
```

### Commit Message Format

Use conventional commit format:
```bash
git commit -m "feat: add product search functionality"
git commit -m "fix: resolve database connection issue"
git commit -m "docs: update API documentation"
git commit -m "refactor: improve error handling in controllers"
```

## 🆘 Getting Help

### Development Issues
- 🐛 **Bug Reports**: Open GitHub issue with reproduction steps
- 💡 **Feature Requests**: Open GitHub issue with detailed description
- 📖 **API Documentation**: Check http://localhost:3001/api/docs when backend is running
- 🔧 **Development Questions**: Check inline comments and type definitions

### Common Commands Reference
```bash
# Quick start
yarn docker:dev

# Development mode
docker compose up db elasticsearch kibana -d
cd apps/backend && yarn run dev
cd apps/frontend && yarn run dev

# Database operations
cd apps/backend && yarn run db:studio
cd apps/backend && yarn run db:seed

# Clean reset
yarn docker:clean && yarn docker:dev

# View logs
yarn docker:logs
docker compose logs -f [service-name]
```

### Useful Resources
- **Prisma Documentation**: https://www.prisma.io/docs
- **Next.js Documentation**: https://nextjs.org/docs
- **Elasticsearch Guide**: https://www.elastic.co/guide/en/elasticsearch/reference/current/
- **Docker Compose Reference**: https://docs.docker.com/compose/

---

**Happy developing with MarketBase! 🚀**