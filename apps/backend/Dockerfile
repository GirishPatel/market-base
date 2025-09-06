FROM node:20-alpine AS base

# Enable Corepack to use Yarn
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package.json files and yarn.lock
COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install dependencies
RUN yarn install

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY apps/backend/ ./apps/backend/

# Generate Prisma client first
WORKDIR /app/apps/backend
RUN yarn prisma generate

# Build shared package
WORKDIR /app/packages/shared
RUN yarn run build

# Build backend
WORKDIR /app/apps/backend
RUN yarn run build

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Start the application
CMD ["yarn", "start"]