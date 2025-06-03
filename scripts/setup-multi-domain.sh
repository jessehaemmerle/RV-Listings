#!/bin/bash

# Setup script for multi-domain deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║       RV CLASSIFIEDS MULTI-DOMAIN         ║
║          DEPLOYMENT SETUP                 ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Get domain from user
echo -n "Enter your domain name (e.g., rv.yourdomain.com): "
read DOMAIN_NAME

echo -n "Enter your email for SSL certificates: "
read SSL_EMAIL

echo -n "Enter project name (default: rv-classifieds): "
read PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-rv-classifieds}

# Check for existing reverse proxy
REVERSE_PROXY=""
if docker ps | grep -q "traefik"; then
    REVERSE_PROXY="traefik"
    log_info "Detected Traefik reverse proxy"
elif docker ps | grep -q "nginx-proxy"; then
    REVERSE_PROXY="nginx-proxy"
    log_info "Detected nginx-proxy"
else
    echo ""
    echo "Which reverse proxy are you using?"
    echo "1) Traefik"
    echo "2) nginx-proxy" 
    echo "3) Custom/Other"
    echo "4) None (I'll set one up)"
    echo -n "Enter choice [1-4]: "
    read proxy_choice
    
    case $proxy_choice in
        1) REVERSE_PROXY="traefik" ;;
        2) REVERSE_PROXY="nginx-proxy" ;;
        3) REVERSE_PROXY="custom" ;;
        4) REVERSE_PROXY="none" ;;
        *) REVERSE_PROXY="traefik" ;;
    esac
fi

# Create proxy network if it doesn't exist
if ! docker network ls | grep -q "proxy"; then
    log_step "Creating proxy network..."
    docker network create proxy
fi

# Generate secure passwords
MONGO_PASS=$(openssl rand -base64 32)
DB_PASS=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

# Create environment file
log_step "Creating environment configuration..."
cat > .env << EOF
# Multi-Domain Configuration for RV Classifieds
COMPOSE_PROJECT_NAME=$PROJECT_NAME
DOMAIN_NAME=$DOMAIN_NAME
SSL_EMAIL=$SSL_EMAIL

# Database Configuration
DB_NAME=${PROJECT_NAME//-/_}_db
MONGO_ROOT_PASSWORD=$MONGO_PASS
DB_PASSWORD=$DB_PASS

# Security
JWT_SECRET_KEY=$JWT_SECRET

# Reverse Proxy Network
REVERSE_PROXY_NETWORK=proxy
EOF

log_info "Environment file created with secure passwords"

# Setup reverse proxy if needed
if [ "$REVERSE_PROXY" = "none" ]; then
    log_step "Setting up Traefik reverse proxy..."
    ./scripts/setup-traefik.sh
elif [ "$REVERSE_PROXY" = "custom" ]; then
    log_info "Please configure your reverse proxy to route $DOMAIN_NAME to this container"
fi

# Build and start services
log_step "Building and starting services..."
docker-compose -f docker-compose.multi-domain.yml up -d --build

# Wait for services
log_step "Waiting for services to start..."
sleep 15

# Check health
if docker-compose -f docker-compose.multi-domain.yml ps | grep -q "Up"; then
    log_info "✅ Services started successfully!"
else
    echo "❌ Some services failed to start. Check logs:"
    docker-compose -f docker-compose.multi-domain.yml logs
    exit 1
fi

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║           DEPLOYMENT COMPLETE!            ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════╝${NC}"
echo ""
log_info "🎉 RV Classifieds is now running at: https://$DOMAIN_NAME"
echo ""
echo "Management Commands:"
echo "===================="
echo "📋 View logs: docker-compose -f docker-compose.multi-domain.yml logs -f"
echo "🔄 Restart: docker-compose -f docker-compose.multi-domain.yml restart"
echo "🛑 Stop: docker-compose -f docker-compose.multi-domain.yml down"
echo "📊 Status: docker-compose -f docker-compose.multi-domain.yml ps"
echo ""

if [ "$REVERSE_PROXY" = "custom" ]; then
    echo -e "${YELLOW}⚠️  Manual reverse proxy configuration needed:${NC}"
    echo "Frontend: http://$PROJECT_NAME-frontend"
    echo "Backend: http://$PROJECT_NAME-backend:8000"
    echo "Domain: $DOMAIN_NAME"
fi
