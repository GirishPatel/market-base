#!/bin/bash

set -e

echo "🚀 Starting backend initialization..."

# Function to wait for database connectivity
wait_for_db() {
  echo "⏳ Waiting for database to be ready..."
  
  # Maximum wait time (30 seconds)
  max_attempts=30
  attempt=0
  
  while [ $attempt -lt $max_attempts ]; do
    if mysql -h db -u root -ppassword -e "SELECT 1;" > /dev/null 2>&1; then
      echo "✅ Database is ready!"
      return 0
    fi
    
    attempt=$((attempt + 1))
    echo "⏳ Database not ready yet, waiting... (attempt $attempt/$max_attempts)"
    sleep 1
  done
  
  echo "❌ Database failed to become ready within timeout"
  exit 1
}

# Function to run migrations
run_migrations() {
  echo "🔄 Generating Prisma client..."
  npx prisma generate
  
  echo "🔄 Running database migrations..."
  npx prisma migrate deploy
  
  echo "✅ Migrations completed successfully"
}

# Function to run seeding
run_seeding() {
  echo "🌱 Running database seeding..."
  
  # Check if data directory exists and has products.json
  if [ ! -f "products.json" ]; then
    echo "⚠️ Warning: products.json not found, skipping seed data insertion"
    echo "   Please ensure data/products.json exists if you want to seed sample data"
    return 0
  fi
  
  npm run db:seed
  echo "✅ Database seeding completed successfully"
}

# Function to start the application
start_app() {
  echo "🚀 Starting the application..."
  npm start
}

# Main initialization sequence
main() {
  echo "🔧 Backend Docker Initialization Script"
  echo "======================================="
  
  # Wait for database to be ready
  # wait_for_db  # Temporarily disabled for debugging
  
  # Run migrations
  run_migrations
  
  # Run seeding
  run_seeding
  
  # Start the application
  start_app
}

# Handle script termination gracefully
trap 'echo "❌ Initialization interrupted"; exit 1' INT TERM

# Run main function
main "$@"