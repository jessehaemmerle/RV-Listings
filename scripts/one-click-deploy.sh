#!/bin/bash

# One-click deployment script for RV Classifieds with domain support

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════╗
║       RV CLASSIFIEDS ONE-CLICK DEPLOY        ║
║           Multi-Domain Ready                 ║
╚══════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed"
    echo "Would you like to install Docker? (y/n)"
    read -r install_docker
    if [[ $install_docker =~ ^[Yy]$ ]]; then
        ./scripts/install-docker.sh
    else
        exit 1
    fi
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed"
    echo "Would you like to install Docker Compose? (y/n)"
    read -r install_compose
    if [[ $install_compose =~ ^[Yy]$ ]]; then
        curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose
    else
        exit 1
    fi
fi

# Get deployment information
echo ""
log_step "Deployment Configuration"
echo "========================="

echo -n "Enter your domain name (e.g., rv.yoursite.com): "
read -r DOMAIN_NAME

echo -n "Enter your email for SSL certificates: "
read -r SSL_EMAIL

echo -n "Enter project name (default: rv-classifieds): "
read -r PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-rv-classifieds}

echo ""
echo "Select deployment type:"
echo "1) New deployment (fresh install)"
echo "2) Add to existing multi-domain setup"
echo -n "Enter choice [1-2]: "
read -r deploy_type

# Check for existing reverse proxy
log_step "Checking for existing reverse proxy..."

REVERSE_PROXY=""
if docker ps | grep -q "traefik"; then
    REVERSE_PROXY="traefik"
    log_info "Found existing Traefik"
elif docker ps | grep -q "nginx-proxy"; then
    REVERSE_PROXY="nginx-proxy"
    log_info "Found existing nginx-proxy"
else
    echo ""
    echo "No reverse proxy found. Which would you like to use?"
    echo "1) Traefik (recommended)"
    echo "2) nginx-proxy"
    echo "3) I have my own reverse proxy"
    echo -n "Enter choice [1-3]: "
    read -r proxy_choice
    
    case $proxy_choice in
        1) REVERSE_PROXY="traefik" ;;
        2) REVERSE_PROXY="nginx-proxy" ;;
        3) REVERSE_PROXY="custom" ;;
    esac
fi

# Create proxy network if needed
if ! docker network ls | grep -q "proxy"; then
    log_step "Creating proxy network..."
    docker network create proxy
fi

# Setup reverse proxy if needed
if [ "$REVERSE_PROXY" = "traefik" ] && ! docker ps | grep -q "traefik"; then
    log_step "Setting up Traefik..."
    ./scripts/setup-traefik.sh
elif [ "$REVERSE_PROXY" = "nginx-proxy" ] && ! docker ps | grep -q "nginx-proxy"; then
    log_step "Setting up nginx-proxy..."
    ./scripts/setup-nginx-proxy.sh
fi

# Generate secure passwords
log_step "Generating secure configuration..."
MONGO_PASS=$(openssl rand -base64 32)
DB_PASS=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)

# Create environment file
cat > .env << EOF
# RV Classifieds Multi-Domain Configuration
COMPOSE_PROJECT_NAME=$PROJECT_NAME
DOMAIN_NAME=$DOMAIN_NAME
SSL_EMAIL=$SSL_EMAIL

# Database Configuration
DB_NAME=${PROJECT_NAME//-/_}_db
MONGO_ROOT_PASSWORD=$MONGO_PASS
DB_PASSWORD=$DB_PASS

# Security
JWT_SECRET_KEY=$JWT_SECRET

# Network Configuration
REVERSE_PROXY_NETWORK=proxy
EOF

log_info "Configuration saved to .env"

# Deploy application
log_step "Deploying RV Classifieds..."

if [ "$deploy_type" = "2" ]; then
    # Add to existing setup
    ./scripts/manage-domains.sh add "$DOMAIN_NAME" "$PROJECT_NAME"
else
    # New deployment
    docker-compose -f docker-compose.multi-domain.yml up -d --build
fi

# Wait for services to start
log_step "Waiting for services to initialize..."
sleep 20

# Health check
log_step "Running health check..."
if ./scripts/health-check.sh; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║             DEPLOYMENT SUCCESSFUL!           ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════╝${NC}"
    echo ""
    log_info "🎉 RV Classifieds is now running!"
    echo ""
    echo "Access Information:"
    echo "=================="
    echo "🌐 Website: https://$DOMAIN_NAME"
    echo "🔧 API: https://$DOMAIN_NAME/api/stats"
    echo ""
    echo "Next Steps:"
    echo "==========="
    echo "1. Visit https://$DOMAIN_NAME to access your RV marketplace"
    echo "2. Register the first user account"
    echo "3. Start adding vehicle listings"
    echo ""
    echo "Management:"
    echo "=========="
    echo "📋 Health check: ./scripts/health-check.sh"
    echo "📊 View logs: docker-compose -f docker-compose.multi-domain.yml logs -f"
    echo "🔄 Restart: docker-compose -f docker-compose.multi-domain.yml restart"
    echo "💾 Backup: ./scripts/backup.sh"
    
    if [ "$REVERSE_PROXY" = "custom" ]; then
        echo ""
        log_warn "⚠️  Manual reverse proxy configuration needed:"
        echo "   Frontend container: $PROJECT_NAME-frontend"
        echo "   Backend container: $PROJECT_NAME-backend:8000"
        echo "   Domain: $DOMAIN_NAME"
    fi
else
    log_error "❌ Deployment failed. Check logs with:"
    echo "docker-compose -f docker-compose.multi-domain.yml logs"
    exit 1
fi
