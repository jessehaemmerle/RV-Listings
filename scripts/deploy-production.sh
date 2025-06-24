#!/bin/bash

# Production Deployment Script for RV Classifieds
# This script deploys the application using Docker Compose

set -e

echo "🚐 RV Classifieds - Production Deployment"
echo "========================================"

# Configuration
APP_NAME="rv-classifieds"
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please run: ./scripts/install-docker.sh"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please run: ./scripts/install-docker.sh"
        exit 1
    fi
    
    print_status "Docker and Docker Compose are available"
}

# Check if user is in docker group
check_docker_permissions() {
    if ! groups $USER | grep -q docker; then
        print_warning "User is not in docker group. You may need to use sudo or run: sudo usermod -aG docker $USER"
    fi
}

# Stop existing containers
stop_existing() {
    echo "🛑 Stopping existing containers..."
    docker compose -f $COMPOSE_FILE down || true
    print_status "Stopped existing containers"
}

# Build and start containers
deploy() {
    echo "🔨 Building and starting containers..."
    
    # Build images
    print_status "Building Docker images..."
    docker compose -f $COMPOSE_FILE build --no-cache
    
    # Start services
    print_status "Starting services..."
    docker compose -f $COMPOSE_FILE up -d
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to start..."
    sleep 30
    
    # Check service health
    check_health
}

# Check service health
check_health() {
    echo "🏥 Checking service health..."
    
    # Check if containers are running
    if docker compose -f $COMPOSE_FILE ps | grep -q "Up"; then
        print_status "Containers are running"
    else
        print_error "Some containers are not running"
        docker compose -f $COMPOSE_FILE ps
        exit 1
    fi
    
    # Check backend health
    echo "🔍 Testing backend API..."
    if docker exec rv-classifieds-backend curl -f http://localhost:8000/api/stats > /dev/null 2>&1; then
        print_status "Backend API is responding"
    else
        print_warning "Backend API health check failed"
    fi
    
    # Check frontend
    echo "🔍 Testing frontend..."
    if curl -f http://localhost/ > /dev/null 2>&1; then
        print_status "Frontend is responding"
    else
        print_warning "Frontend health check failed"
    fi
}

# Show deployment info
show_info() {
    echo ""
    echo "🎉 Deployment Complete!"
    echo "======================"
    echo ""
    echo "📍 Application URL: http://localhost"
    echo "🔧 Backend API: http://localhost/api/stats"
    echo ""
    echo "📊 Service Status:"
    docker compose -f $COMPOSE_FILE ps
    echo ""
    echo "📋 Useful Commands:"
    echo "  View logs: docker compose logs -f"
    echo "  Stop app: docker compose down"
    echo "  Restart: docker compose restart"
    echo "  Update: docker compose pull && docker compose up -d"
    echo ""
    echo "🔒 Security Notes:"
    echo "  - MongoDB is not exposed externally"
    echo "  - Change default passwords in .env.production"
    echo "  - Set up SSL/HTTPS for production use"
    echo ""
}

# Main execution
main() {
    print_status "Starting deployment process..."
    
    check_docker
    check_docker_permissions
    stop_existing
    deploy
    show_info
    
    print_status "Deployment completed successfully!"
}

# Run main function
main "$@"