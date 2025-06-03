#!/bin/bash

# RV Classifieds VPS Deployment Script for Existing Reverse Proxy Setup
# This script deploys RV Classifieds alongside other containers with different domains

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    if ! docker network ls | grep -q "traefik\|nginx-proxy\|proxy"; then
        print_warning "No reverse proxy network found. Available networks:"
        docker network ls
        echo
        read -p "Enter the name of your reverse proxy network: " NETWORK_NAME
        if [ -z "$NETWORK_NAME" ]; then
            print_error "Network name is required."
            exit 1
        fi
    fi
    
    print_success "Prerequisites check passed!"
}

# Detect reverse proxy type
detect_proxy_type() {
    print_status "Detecting reverse proxy setup..."
    
    if docker ps | grep -q traefik; then
        PROXY_TYPE="traefik"
        PROXY_NETWORK="proxy"
        print_success "Detected Traefik reverse proxy"
    elif docker ps | grep -q nginx-proxy; then
        PROXY_TYPE="nginx-proxy"
        PROXY_NETWORK="proxy"
        print_success "Detected nginx-proxy reverse proxy"
    else
        print_warning "Could not auto-detect reverse proxy type."
        echo "Available options:"
        echo "1) Traefik"
        echo "2) nginx-proxy"
        echo "3) Nginx Proxy Manager"
        echo "4) Custom/Manual"
        read -p "Select your reverse proxy type (1-4): " choice
        
        case $choice in
            1)
                PROXY_TYPE="traefik"
                PROXY_NETWORK="proxy"
                ;;
            2)
                PROXY_TYPE="nginx-proxy"
                PROXY_NETWORK="proxy"
                ;;
            3)
                PROXY_TYPE="nginx-proxy-manager"
                PROXY_NETWORK="proxy"
                ;;
            4)
                PROXY_TYPE="manual"
                read -p "Enter your proxy network name: " PROXY_NETWORK
                ;;
            *)
                print_error "Invalid choice"
                exit 1
                ;;
        esac
    fi
    
    # Verify network exists
    if ! docker network ls | grep -q "$PROXY_NETWORK"; then
        print_error "Network '$PROXY_NETWORK' does not exist."
        print_status "Creating network '$PROXY_NETWORK'..."
        docker network create "$PROXY_NETWORK"
    fi
}

# Setup environment configuration
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        cp .env.multi-domain .env
        
        # Get domain from user
        read -p "Enter your domain for RV Classifieds (e.g., rv.yourdomain.com): " domain
        if [ -z "$domain" ]; then
            print_error "Domain is required."
            exit 1
        fi
        
        # Get project name
        read -p "Enter project name (default: rv-classifieds): " project_name
        project_name=${project_name:-rv-classifieds}
        
        # Get email for SSL
        read -p "Enter your email for SSL certificates: " email
        if [ -z "$email" ]; then
            print_error "Email is required for SSL certificates."
            exit 1
        fi
        
        # Generate secure passwords
        if command_exists openssl; then
            JWT_SECRET=$(openssl rand -base64 64)
            MONGO_PASS=$(openssl rand -base64 32)
            DB_PASS=$(openssl rand -base64 32)
        else
            JWT_SECRET=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 64 | head -n 1)
            MONGO_PASS=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
            DB_PASS=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)
        fi
        
        # Update .env file
        sed -i.bak "s/DOMAIN_NAME=rv.your-domain.com/DOMAIN_NAME=$domain/" .env
        sed -i.bak "s/SSL_EMAIL=admin@your-domain.com/SSL_EMAIL=$email/" .env
        sed -i.bak "s/COMPOSE_PROJECT_NAME=rv-classifieds/COMPOSE_PROJECT_NAME=$project_name/" .env
        sed -i.bak "s/your_very_secure_jwt_secret_key_here/$JWT_SECRET/" .env
        sed -i.bak "s/your_secure_mongo_password_here/$MONGO_PASS/" .env
        sed -i.bak "s/your_secure_db_password_here/$DB_PASS/" .env
        sed -i.bak "s/REVERSE_PROXY_NETWORK=proxy/REVERSE_PROXY_NETWORK=$PROXY_NETWORK/" .env
        
        rm .env.bak 2>/dev/null || true
        
        print_success "Environment file created with domain: $domain"
    else
        print_success "Environment file already exists."
        source .env
        domain=$DOMAIN_NAME
        project_name=$COMPOSE_PROJECT_NAME
    fi
}

# Select and prepare docker-compose file
prepare_compose_file() {
    print_status "Preparing Docker Compose configuration..."
    
    COMPOSE_FILE="docker-compose.multi-domain.yml"
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Compose file $COMPOSE_FILE not found!"
        exit 1
    fi
    
    # Update network name in compose file if needed
    if [ "$PROXY_NETWORK" != "proxy" ]; then
        sed "s/proxy/$PROXY_NETWORK/g" "$COMPOSE_FILE" > docker-compose.custom.yml
        COMPOSE_FILE="docker-compose.custom.yml"
    fi
    
    print_success "Using compose file: $COMPOSE_FILE"
}

# Deploy the application
deploy_application() {
    print_status "Deploying RV Classifieds application..."
    
    # Build and deploy
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 30
    
    # Check if services are running
    if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        print_success "Application deployed successfully!"
        
        echo
        echo "🎉 RV Classifieds is now deployed!"
        echo "📍 Domain: https://$domain"
        echo "🔧 API Health: https://$domain/api/stats"
        echo
        
        # Show running containers
        docker-compose -f "$COMPOSE_FILE" ps
        
        # Run health check
        if [ -f "scripts/health-check.sh" ]; then
            print_status "Running health check..."
            ./scripts/health-check.sh || print_warning "Health check had some warnings"
        fi
        
    else
        print_error "Some services failed to start. Check logs:"
        docker-compose -f "$COMPOSE_FILE" logs
        exit 1
    fi
}

# Create management scripts
create_management_scripts() {
    print_status "Creating management scripts..."
    
    # Create start script
    cat > start-rv-classifieds.sh << EOF
#!/bin/bash
echo "Starting RV Classifieds application..."
docker-compose -f $COMPOSE_FILE up -d
echo "Application started. Access it at https://$domain"
EOF
    
    # Create stop script
    cat > stop-rv-classifieds.sh << EOF
#!/bin/bash
echo "Stopping RV Classifieds application..."
docker-compose -f $COMPOSE_FILE down
echo "Application stopped."
EOF
    
    # Create restart script
    cat > restart-rv-classifieds.sh << EOF
#!/bin/bash
echo "Restarting RV Classifieds application..."
docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE up -d
echo "Application restarted."
EOF
    
    # Create logs script
    cat > logs-rv-classifieds.sh << EOF
#!/bin/bash
if [ -z "\$1" ]; then
    echo "Showing all logs..."
    docker-compose -f $COMPOSE_FILE logs -f
else
    echo "Showing logs for service: \$1"
    docker-compose -f $COMPOSE_FILE logs -f \$1
fi
EOF
    
    # Create update script
    cat > update-rv-classifieds.sh << EOF
#!/bin/bash
echo "Updating RV Classifieds application..."

# Create backup first
if [ -f "scripts/backup.sh" ]; then
    echo "Creating backup..."
    ./scripts/backup.sh
fi

# Pull latest changes (if using git)
if [ -d ".git" ]; then
    git pull
fi

# Rebuild and restart
docker-compose -f $COMPOSE_FILE build --no-cache
docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE up -d

echo "Application updated and restarted."
EOF
    
    # Create backup script
    cat > backup-rv-classifieds.sh << EOF
#!/bin/bash
echo "Creating backup of RV Classifieds..."
if [ -f "scripts/backup.sh" ]; then
    ./scripts/backup.sh
else
    # Basic backup
    BACKUP_DIR="backup-\$(date +%Y%m%d_%H%M%S)"
    mkdir -p "\$BACKUP_DIR"
    
    # Backup database
    docker exec $project_name-mongodb mongodump --out /backup
    docker cp $project_name-mongodb:/backup "\$BACKUP_DIR/mongodb"
    
    # Backup app files
    tar -czf "\$BACKUP_DIR/app_files.tar.gz" .env $COMPOSE_FILE
    
    echo "Backup created in \$BACKUP_DIR"
fi
EOF
    
    # Create health check script
    cat > health-rv-classifieds.sh << EOF
#!/bin/bash
echo "Running health check for RV Classifieds..."
if [ -f "scripts/health-check.sh" ]; then
    ./scripts/health-check.sh
else
    echo "Checking container status..."
    docker-compose -f $COMPOSE_FILE ps
    
    echo ""
    echo "Testing API endpoint..."
    if curl -f -s "https://$domain/api/stats" > /dev/null; then
        echo "✅ API is responding"
    else
        echo "❌ API is not responding"
    fi
    
    echo ""
    echo "Testing frontend..."
    if curl -f -s "https://$domain" > /dev/null; then
        echo "✅ Frontend is responding"
    else
        echo "❌ Frontend is not responding"
    fi
fi
EOF
    
    # Make scripts executable
    chmod +x start-rv-classifieds.sh stop-rv-classifieds.sh restart-rv-classifieds.sh logs-rv-classifieds.sh update-rv-classifieds.sh backup-rv-classifieds.sh health-rv-classifieds.sh
    
    print_success "Management scripts created!"
}

# Display reverse proxy configuration instructions
show_proxy_instructions() {
    echo
    print_status "📋 Reverse Proxy Configuration Instructions:"
    echo
    
    case $PROXY_TYPE in
        "traefik")
            echo "✅ Traefik configuration is automatic via container labels"
            echo "   SSL certificates will be automatically obtained"
            ;;
        "nginx-proxy")
            echo "✅ nginx-proxy configuration is automatic via container labels"
            echo "   SSL certificates will be automatically obtained"
            ;;
        "nginx-proxy-manager")
            echo "📝 Nginx Proxy Manager Configuration:"
            echo "   1. Open your NPM admin panel"
            echo "   2. Add new Proxy Host:"
            echo "      - Domain Names: $domain"
            echo "      - Scheme: http"
            echo "      - Forward Hostname/IP: $project_name-frontend"
            echo "      - Forward Port: 80"
            echo "      - Enable 'Cache Assets' and 'Block Common Exploits'"
            echo "   3. Add another Proxy Host for API:"
            echo "      - Domain Names: $domain"
            echo "      - Scheme: http"
            echo "      - Forward Hostname/IP: $project_name-backend"
            echo "      - Forward Port: 8000"
            echo "      - Advanced: Add '/api' to the path"
            echo "   4. Enable SSL with Let's Encrypt for both"
            ;;
        "manual")
            echo "📝 Manual Configuration Required:"
            echo "   Frontend: http://$project_name-frontend:80"
            echo "   Backend API: http://$project_name-backend:8000"
            echo "   Domain: $domain"
            echo "   Network: $PROXY_NETWORK"
            echo
            echo "   Example nginx configuration:"
            echo "   server {"
            echo "       listen 443 ssl;"
            echo "       server_name $domain;"
            echo "       location /api {"
            echo "           proxy_pass http://$project_name-backend:8000;"
            echo "       }"
            echo "       location / {"
            echo "           proxy_pass http://$project_name-frontend:80;"
            echo "       }"
            echo "   }"
            ;;
    esac
}

# Main deployment function
main() {
    echo
    echo "🚐 RV Classifieds VPS Deployment"
    echo "================================="
    print_status "Starting RV Classifieds VPS deployment..."
    
    # Check prerequisites
    check_prerequisites
    
    # Detect reverse proxy
    detect_proxy_type
    
    # Setup environment
    setup_environment
    
    # Prepare compose file
    prepare_compose_file
    
    # Deploy application
    deploy_application
    
    # Create management scripts
    create_management_scripts
    
    # Show proxy instructions
    show_proxy_instructions
    
    # Final instructions
    echo
    print_success "🎉 RV Classifieds VPS deployment completed successfully!"
    echo
    echo "📋 VPS Management Commands:"
    echo "  Start application:    ./start-rv-classifieds.sh"
    echo "  Stop application:     ./stop-rv-classifieds.sh"
    echo "  Restart application:  ./restart-rv-classifieds.sh"
    echo "  View logs:           ./logs-rv-classifieds.sh [service_name]"
    echo "  Update application:  ./update-rv-classifieds.sh"
    echo "  Backup data:         ./backup-rv-classifieds.sh"
    echo "  Health check:        ./health-rv-classifieds.sh"
    echo
    echo "🌐 Access your RV marketplace:"
    echo "  Frontend: https://$domain"
    echo "  API Health: https://$domain/api/stats"
    echo "  Browse listings: https://$domain/listings"
    echo "  Register/Login: https://$domain/register"
    echo
    echo "📁 Important files:"
    echo "  Environment: .env"
    echo "  Compose file: $COMPOSE_FILE"
    echo "  Logs: docker-compose -f $COMPOSE_FILE logs"
    echo
    echo "🔧 Container names:"
    echo "  Frontend: $project_name-frontend"
    echo "  Backend: $project_name-backend"
    echo "  Database: $project_name-mongodb"
    echo
    print_warning "SSL certificates will be automatically obtained by your reverse proxy."
    echo
    print_status "🚀 Your RV Classifieds marketplace is ready for users!"
    echo "      Users can now browse listings, register accounts, and start trading RVs!"
}

# Run main function
main "$@"