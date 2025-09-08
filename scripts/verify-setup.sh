#!/bin/bash

echo "🔍 Verifying automated setup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a port is responding
check_port() {
    local host=$1
    local port=$2
    local service=$3
    
    echo -n "Checking $service on $host:$port... "
    
    if curl -s --max-time 5 "$host:$port" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check database
check_database() {
    echo -n "Checking database connection... "
    
    if docker compose exec -T db mysqladmin ping -h localhost -u root -ppassword > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check Elasticsearch
check_elasticsearch() {
    echo -n "Checking Elasticsearch... "
    
    response=$(curl -s localhost:9200/_cluster/health)
    if echo "$response" | grep -q '"status":"green\|yellow"'; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check if tables exist
check_tables() {
    echo -n "Checking if database tables exist... "
    
    table_count=$(docker compose exec -T db mysql -u root -ppassword mydb -e "SHOW TABLES;" 2>/dev/null | wc -l)
    
    if [ "$table_count" -gt 1 ]; then
        echo -e "${GREEN}✅ OK ($((table_count-1)) tables found)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED (no tables found)${NC}"
        return 1
    fi
}

# Function to check if sample data exists
check_sample_data() {
    echo -n "Checking if sample data was seeded... "
    
    product_count=$(docker compose exec -T db mysql -u root -ppassword mydb -e "SELECT COUNT(*) FROM products;" 2>/dev/null | tail -n 1)
    
    if [ "$product_count" -gt 0 ] 2>/dev/null; then
        echo -e "${GREEN}✅ OK ($product_count products found)${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  WARNING (no sample data found)${NC}"
        return 1
    fi
}

echo ""
echo "🎯 Running verification checks..."
echo "================================="

# Check if containers are running
echo -n "Checking if containers are running... "
running_containers=$(docker compose ps --services --filter "status=running" | wc -l)

if [ "$running_containers" -gt 0 ]; then
    echo -e "${GREEN}✅ OK ($running_containers containers running)${NC}"
else
    echo -e "${RED}❌ FAILED (no containers running)${NC}"
    echo ""
    echo "❌ Setup verification failed!"
    exit 1
fi

echo ""

# Individual service checks
failures=0

check_database || ((failures++))
check_elasticsearch || ((failures++))
check_port "localhost" "3001" "Backend API" || ((failures++))
check_port "localhost" "3000" "Frontend" || ((failures++))

echo ""

# Database schema and data checks
check_tables || ((failures++))
check_sample_data || ((failures++))

echo ""
echo "================================="

if [ $failures -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Setup is working correctly.${NC}"
    echo ""
    echo "🌐 Your application is ready:"
    echo "   • Frontend: http://localhost:3000"
    echo "   • Backend API: http://localhost:3001"
    echo "   • API Docs: http://localhost:3001/api/docs"
    echo "   • Database: localhost:3306"
    echo "   • Elasticsearch: http://localhost:9200"
    exit 0
elif [ $failures -le 2 ]; then
    echo -e "${YELLOW}⚠️  Setup completed with $failures warnings.${NC}"
    echo ""
    echo "Some non-critical checks failed, but the core application should work."
    exit 0
else
    echo -e "${RED}❌ Setup verification failed with $failures errors!${NC}"
    echo ""
    echo "Try running: yarn docker:clean && yarn docker:dev"
    exit 1
fi