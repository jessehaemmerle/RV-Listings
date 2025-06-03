#!/bin/bash

# RV Classifieds Deployment Script
# This script automates the deployment process

set -e

echo "🚐 RV Classifieds Deployment Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    log_warn ".env file not found. Creating from example..."
    cp .env.example .env
    log_warn "Please edit .env file with your configuration before continuing."
    exit 1
fi

# Get deployment type
DEPLOYMENT_TYPE=${1:-development}

if [ "$DEPLOYMENT_TYPE" = "production" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    log_info "Deploying in PRODUCTION mode"
else
    COMPOSE_FILE="docker-compose.yml"
    log_info "Deploying in DEVELOPMENT mode"
fi

# Stop existing containers
log_info "Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down

# Build images
log_info "Building Docker images..."
docker-compose -f $COMPOSE_FILE build --no-cache

# Start services
log_info "Starting services..."
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be ready
log_info "Waiting for services to be ready..."
sleep 10

# Check service health
log_info "Checking service health..."
if docker-compose -f $COMPOSE_FILE ps | grep -q "Up"; then
    log_info "✅ Services are running!"
else
    log_error "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Display access information
echo ""
log_info "🎉 Deployment completed successfully!"
echo ""
echo "Access Information:"
echo "=================="

if [ "$DEPLOYMENT_TYPE" = "production" ]; then
    DOMAIN=$(grep DOMAIN_NAME .env | cut -d '=' -f2 | tr -d '"')
    HTTP_PORT=$(grep HTTP_PORT .env | cut -d '=' -f2 | tr -d '"' || echo "80")
    
    if [ "$HTTP_PORT" = "80" ]; then
        echo "🌐 Application: http://$DOMAIN"
    else
        echo "🌐 Application: http://$DOMAIN:$HTTP_PORT"
    fi
else
    SERVER_IP=$(hostname -I | awk '{print $1}')
    echo "🌐 Frontend: http://$SERVER_IP:3000"
    echo "🔧 Backend API: http://$SERVER_IP:8000"
    echo "📊 API Stats: http://$SERVER_IP:8000/api/stats"
fi

echo ""
echo "Useful Commands:"
echo "==============="
echo "📋 View logs: docker-compose -f $COMPOSE_FILE logs -f"
echo "🔄 Restart: docker-compose -f $COMPOSE_FILE restart"
echo "🛑 Stop: docker-compose -f $COMPOSE_FILE down"
echo "📊 Status: docker-compose -f $COMPOSE_FILE ps"
echo ""

log_info "Deployment script completed!"
