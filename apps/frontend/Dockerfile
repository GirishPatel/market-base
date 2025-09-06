FROM node:20-alpine AS base

# Enable Corepack to use Yarn
RUN corepack enable

# Set working directory
WORKDIR /app

# Copy package.json files and yarn.lock
COPY package.json yarn.lock .yarnrc.yml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN yarn install

# Copy source code
COPY packages/shared/ ./packages/shared/
COPY apps/frontend/ ./apps/frontend/

# Build shared package
WORKDIR /app/packages/shared
RUN yarn run build

# Build frontend
WORKDIR /app/apps/frontend
RUN yarn run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]