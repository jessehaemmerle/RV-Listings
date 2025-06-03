#!/bin/bash

# Health check script for RV Classifieds multi-domain deployment

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Load environment variables
if [ -f .env ]; then
    source .env
else
    log_error ".env file not found"
    exit 1
fi

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║         RV CLASSIFIEDS HEALTH CHECK       ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if containers are running
log_step "Checking container status..."
CONTAINERS=(
    "${COMPOSE_PROJECT_NAME:-rv-classifieds}-frontend"
    "${COMPOSE_PROJECT_NAME:-rv-classifieds}-backend"
    "${COMPOSE_PROJECT_NAME:-rv-classifieds}-mongodb"
)

ALL_RUNNING=true
for container in "${CONTAINERS[@]}"; do
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        log_info "✅ $container is running"
    else
        log_error "❌ $container is not running"
        ALL_RUNNING=false
    fi
done

if [ "$ALL_RUNNING" = false ]; then
    log_error "Some containers are not running. Check with: docker-compose -f docker-compose.multi-domain.yml ps"
    exit 1
fi

# Check network connectivity
log_step "Checking network connectivity..."

# Test backend health
if docker exec "${COMPOSE_PROJECT_NAME:-rv-classifieds}-backend" curl -f http://localhost:8000/api/stats > /dev/null 2>&1; then
    log_info "✅ Backend API is responding"
else
    log_error "❌ Backend API is not responding"
fi

# Test database connectivity
if docker exec "${COMPOSE_PROJECT_NAME:-rv-classifieds}-backend" python -c "
import os
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def test_db():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    try:
        await client.admin.command('ping')
        print('Database connection: OK')
    except Exception as e:
        print(f'Database connection: FAILED - {e}')
        exit(1)
    finally:
        client.close()

asyncio.run(test_db())
" 2>/dev/null; then
    log_info "✅ Database connection is working"
else
    log_error "❌ Database connection failed"
fi

# Test frontend health
if docker exec "${COMPOSE_PROJECT_NAME:-rv-classifieds}-frontend" curl -f http://localhost/health > /dev/null 2>&1; then
    log_info "✅ Frontend is responding"
else
    log_error "❌ Frontend is not responding"
fi

# Check reverse proxy
log_step "Checking reverse proxy configuration..."

# Check if domain resolves
if command -v dig > /dev/null 2>&1; then
    if dig +short "${DOMAIN_NAME}" | grep -q .; then
        log_info "✅ Domain ${DOMAIN_NAME} resolves"
    else
        log_warn "⚠️  Domain ${DOMAIN_NAME} does not resolve"
    fi
fi

# Test external access
log_step "Testing external access..."

if command -v curl > /dev/null 2>&1; then
    # Test HTTPS if available
    if curl -f -s "https://${DOMAIN_NAME}/health" > /dev/null 2>&1; then
        log_info "✅ HTTPS access working: https://${DOMAIN_NAME}"
    elif curl -f -s "http://${DOMAIN_NAME}/health" > /dev/null 2>&1; then
        log_info "✅ HTTP access working: http://${DOMAIN_NAME}"
        log_warn "⚠️  Consider enabling HTTPS"
    else
        log_error "❌ External access failed for ${DOMAIN_NAME}"
        log_info "Check your reverse proxy configuration"
    fi

    # Test API access
    if curl -f -s "https://${DOMAIN_NAME}/api/stats" > /dev/null 2>&1; then
        log_info "✅ API access working: https://${DOMAIN_NAME}/api"
    elif curl -f -s "http://${DOMAIN_NAME}/api/stats" > /dev/null 2>&1; then
        log_info "✅ API access working: http://${DOMAIN_NAME}/api"
    else
        log_error "❌ API access failed"
    fi
fi

# Check Docker networks
log_step "Checking Docker networks..."

if docker network ls | grep -q "${REVERSE_PROXY_NETWORK:-proxy}"; then
    log_info "✅ Proxy network exists: ${REVERSE_PROXY_NETWORK:-proxy}"
else
    log_error "❌ Proxy network missing: ${REVERSE_PROXY_NETWORK:-proxy}"
    log_info "Create with: docker network create ${REVERSE_PROXY_NETWORK:-proxy}"
fi

# Check reverse proxy containers
if docker ps | grep -q "traefik"; then
    log_info "✅ Traefik reverse proxy is running"
elif docker ps | grep -q "nginx-proxy"; then
    log_info "✅ nginx-proxy is running"
else
    log_warn "⚠️  No common reverse proxy detected"
    log_info "Make sure your reverse proxy is configured for ${DOMAIN_NAME}"
fi

# Resource usage check
log_step "Checking resource usage..."

for container in "${CONTAINERS[@]}"; do
    if docker ps --format "{{.Names}}" | grep -q "^${container}$"; then
        STATS=$(docker stats --no-stream --format "{{.CPUPerc}} {{.MemUsage}}" "$container")
        log_info "📊 $container: CPU: $(echo $STATS | cut -d' ' -f1), Memory: $(echo $STATS | cut -d' ' -f2)"
    fi
done

# Final summary
echo ""
log_step "Health Check Summary"
echo "===================="
echo "🌐 Domain: ${DOMAIN_NAME}"
echo "📦 Project: ${COMPOSE_PROJECT_NAME:-rv-classifieds}"
echo "🔗 Network: ${REVERSE_PROXY_NETWORK:-proxy}"
echo ""

echo "Quick Commands:"
echo "📋 View logs: docker-compose -f docker-compose.multi-domain.yml logs -f"
echo "🔄 Restart: docker-compose -f docker-compose.multi-domain.yml restart"  
echo "📊 Status: docker-compose -f docker-compose.multi-domain.yml ps"
echo ""

log_info "Health check completed!"
