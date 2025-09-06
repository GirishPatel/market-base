# Fullstack Monorepo

A production-ready fullstack application built with modern technologies and best practices. This monorepo contains a **Next.js frontend**, **Express.js backend**, **MySQL database**, and **Elasticsearch** for search functionality.

## 🚀 Quick Start

### Option 1: Full Docker (Recommended for first-time users)
Get the entire application running with one command:

```bash
docker-compose up
```

This **automatically builds and runs** all services. Then visit:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api/docs

### Option 2: Local Development (Recommended for active development)
For faster development with hot reload:

```bash
# 1. Start only database services in Docker
docker-compose up db elasticsearch -d

# 2. Run services locally (see DEVELOPMENT.md for full guide)
yarn install
cd apps/backend && yarn run db:migrate && yarn run db:seed
cd apps/backend && yarn run dev  # Terminal 1
cd apps/frontend && yarn run dev  # Terminal 2
```

📖 **See [DEVELOPMENT.md](./DEVELOPMENT.md) for complete local development setup**

## 📋 Prerequisites

- **Docker** and **Docker Compose**
- **Node.js 20+** (for local development)
- **Yarn 4+** (package manager)

## 🏗️ Architecture

```
fullstack-monorepo/
├── apps/
│   ├── frontend/          # Next.js 14 + TypeScript + shadcn/ui
│   └── backend/           # Express.js + TypeScript + Prisma
├── packages/
│   └── shared/            # Shared types and utilities
├── docker-compose.yml     # Full stack orchestration
└── package.json           # Workspace configuration
```

### Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Express.js, TypeScript, Prisma ORM, Swagger/OpenAPI |
| **Database** | MySQL 8.0 |
| **Search** | Elasticsearch 9.1 |
| **Build System** | Turborepo, Yarn Workspaces |
| **DevOps** | Docker, Docker Compose |
| **Code Quality** | ESLint, Prettier, Husky, Commitlint |
| **Testing** | Jest, Testing Library |

## 🛠️ Development Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd fullstack-monorepo
yarn install    # This generates yarn.lock
```

### 2. Environment Setup

Backend environment:
Update environment variable in .env file

Frontend environment:
Update environment variable in .env file.local

### 3. Database Setup

Start only the database services:
```bash
docker-compose up db elasticsearch -d
```

Run database migrations and seed:
```bash
cd apps/backend
yarn run db:migrate
yarn run db:seed
```

### 4. Development Mode

Run all applications in development mode:
```bash
yarn run dev
```

Or run individual services:
```bash
# Backend only
cd apps/backend && yarn run dev

# Frontend only
cd apps/frontend && yarn run dev
```

## 📝 Available Commands

### Root Level

```bash
yarn run dev           # Start all apps in development mode
yarn run build         # Build all applications
yarn test              # Run all tests
yarn run lint          # Lint all code
yarn run format        # Format all code
yarn run typecheck     # Type check all TypeScript
yarn run clean         # Clean all build artifacts

# Docker commands
yarn run docker:up     # Start all services with Docker
yarn run docker:down   # Stop all Docker services
yarn run docker:logs   # View logs from all services
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
yarn run db:studio     # Open Prisma Studio
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

**`docker-compose up`:**
- ✅ **Automatically builds** images if they don't exist
- ✅ **Uses cached images** if no changes detected
- ✅ **Starts all services** (MySQL, Elasticsearch, Backend, Frontend)

**`docker-compose up --build`:**
- ✅ **Forces rebuild** of all images
- ✅ **Use this after code changes** for guaranteed fresh build

### Service Options

```bash
# Full stack (builds + runs everything)
docker-compose up

# Force rebuild after code changes
docker-compose up --build

# Database services only (for local development)
docker-compose up db elasticsearch -d

# Individual services
docker-compose up db                              # MySQL only
docker-compose up db elasticsearch               # DB + Search
docker-compose up db elasticsearch backend       # All except frontend
```

### Docker Management

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v

# View running services
docker-compose ps

# View logs
docker-compose logs -f
```

## 🔍 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:3001/api/docs
- **Health Check**: http://localhost:3001/api/health

### Sample API Endpoints

```bash
# Health check
GET /api/health

# Users
GET /api/users
POST /api/users
GET /api/users/:id
PUT /api/users/:id
DELETE /api/users/:id

# Articles
GET /api/articles
POST /api/articles
GET /api/articles/:id
PUT /api/articles/:id
DELETE /api/articles/:id
GET /api/articles/author/:authorId

# Search
GET /api/search?q=query&type=users
GET /api/search?q=query&type=articles
```

## 🧪 Testing

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn run test:watch

# Run tests with coverage
yarn test -- --coverage

# Test specific package
yarn workspace apps/backend test
yarn workspace apps/frontend test
```

## 🔧 Code Quality

The project includes comprehensive code quality tools:

- **ESLint**: Modern flat config with TypeScript rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit and commit-msg
- **Commitlint**: Conventional commit message format
- **lint-staged**: Run linters on staged files

### Pre-commit Hooks

Before each commit, the following runs automatically:
```bash
lint-staged  # Lint and format staged files
commitlint   # Validate commit message format
```

### Manual Quality Checks

```bash
yarn run lint       # Check for linting issues
yarn run lint:fix   # Fix auto-fixable linting issues
yarn run format     # Format all code
yarn run typecheck  # Run TypeScript checks
```

## 📁 Project Structure

```
fullstack-monorepo/
├── apps/
│   ├── frontend/                    # Next.js application
│   │   ├── src/
│   │   │   ├── app/                # App Router pages
│   │   │   ├── components/         # React components
│   │   │   │   └── ui/            # shadcn/ui components
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   └── lib/               # Utilities and API client
│   │   ├── Dockerfile
│   │   └── package.json
│   └── backend/                     # Express.js application
│       ├── src/
│       │   ├── config/            # Configuration files
│       │   ├── controllers/       # API controllers
│       │   ├── middleware/        # Express middleware
│       │   ├── repositories/      # Data access layer
│       │   ├── routes/           # API routes
│       │   ├── services/         # Business logic layer
│       │   └── __tests__/        # Test files
│       ├── prisma/               # Database schema and migrations
│       ├── Dockerfile
│       └── package.json
├── packages/
│   └── shared/                      # Shared types and utilities
│       ├── src/
│       │   ├── types.ts          # TypeScript interfaces
│       │   ├── schemas.ts        # Zod validation schemas
│       │   └── constants.ts      # Shared constants
│       └── package.json
├── docker-compose.yml              # Multi-service orchestration
├── turbo.json                      # Turborepo configuration
└── package.json                    # Root package configuration
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API endpoint protection
- **Input Validation**: Zod schema validation
- **Environment Variables**: Secure configuration management

## 🌟 Features

### Backend Features
- ✅ **Layered Architecture**: Controllers → Services → Repositories
- ✅ **Database ORM**: Prisma with MySQL
- ✅ **Search Engine**: Elasticsearch integration with fallback
- ✅ **API Documentation**: Auto-generated Swagger/OpenAPI docs
- ✅ **Validation**: Request/response validation with Zod
- ✅ **Error Handling**: Centralized error handling
- ✅ **Logging**: Winston logger with multiple transports
- ✅ **Testing**: Jest with supertest for API testing
- ✅ **Health Checks**: Database and service health monitoring

### Frontend Features
- ✅ **Modern UI**: shadcn/ui component library
- ✅ **Type Safety**: Full TypeScript integration
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **API Integration**: Type-safe API client
- ✅ **Toast Notifications**: User feedback system
- ✅ **Search Interface**: Real-time search functionality
- ✅ **Testing**: Jest with Testing Library

### DevOps Features
- ✅ **Containerization**: Docker multi-stage builds
- ✅ **Orchestration**: Docker Compose for full stack
- ✅ **Build System**: Turborepo for efficient builds
- ✅ **Code Quality**: ESLint + Prettier + Husky
- ✅ **Type Checking**: Strict TypeScript configuration
- ✅ **Hot Reload**: Development with live reloading

## 🚀 Deployment

### Docker Production

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Individual Deployment

Each application can be deployed separately:

**Backend**:
- Can be deployed to any Node.js hosting service
- Requires MySQL and Elasticsearch connections
- Environment variables for configuration

**Frontend**:
- Can be deployed to Vercel, Netlify, or any static hosting
- Requires backend API URL configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Commit using conventional format: `git commit -m "feat: add amazing feature"`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

**Docker services won't start**:
```bash
# Clean up Docker resources
docker-compose down -v
docker system prune
docker-compose up --build
```

**Database connection issues**:
```bash
# Check if MySQL is running
docker-compose ps
# Restart database
docker-compose restart db
```

**Port conflicts**:
- Frontend: Change port in `apps/frontend/package.json`
- Backend: Set `PORT` environment variable
- Database: Change port mapping in `docker-compose.yml`

**TypeScript errors**:
```bash
# Regenerate types
yarn run typecheck
# Clean and rebuild
yarn run clean && yarn run build
```

### Getting Help

- 🐛 **Bug Reports**: Open an issue with reproduction steps
- 💡 **Feature Requests**: Open an issue with detailed description
- 📖 **Documentation**: Check the inline comments and type definitions
- 🔧 **Development**: Refer to individual package README files

---

**Happy coding! 🎉**