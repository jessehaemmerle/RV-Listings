#!/bin/bash

# RV Classifieds Complete Installation Script for Ubuntu VPS
# This script installs Docker, sets up the application, and deploys it

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════╗
║         RV CLASSIFIEDS SETUP          ║
║    Complete Docker Deployment         ║
╚═══════════════════════════════════════╝
EOF
echo -e "${NC}"

# Check if running on Ubuntu
if ! command -v apt-get &> /dev/null; then
    log_error "This script is designed for Ubuntu. Please install manually."
    exit 1
fi

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    log_warn "Running as root. This script will create a 'rvapp' user for better security."
    
    # Create user for the application
    if ! id "rvapp" &>/dev/null; then
        log_step "Creating 'rvapp' user..."
        useradd -m -s /bin/bash rvapp
        usermod -aG sudo rvapp
        log_info "Created user 'rvapp'. You can switch to it with: sudo su - rvapp"
    fi
fi

# Update system
log_step "Updating system packages..."
apt-get update && apt-get upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    log_step "Installing Docker..."
    
    # Install prerequisites
    apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io
    
    log_info "Docker installed successfully"
else
    log_info "Docker already installed"
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    log_step "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    log_info "Docker Compose installed successfully"
else
    log_info "Docker Compose already installed"
fi

# Add current user to docker group
if [ "$EUID" -ne 0 ]; then
    log_step "Adding current user to docker group..."
    sudo usermod -aG docker $USER
else
    usermod -aG docker rvapp
fi

# Set up application directory
APP_DIR="/opt/rv-classifieds"
log_step "Setting up application directory: $APP_DIR"

if [ ! -d "$APP_DIR" ]; then
    mkdir -p $APP_DIR
fi

# If application files are already present, backup them
if [ -f "$APP_DIR/docker-compose.yml" ]; then
    log_warn "Existing installation found. Creating backup..."
    cp -r $APP_DIR $APP_DIR.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy application files (assumes this script is run from the app directory)
if [ -f "docker-compose.yml" ]; then
    log_step "Copying application files..."
    cp -r . $APP_DIR/
    chown -R rvapp:rvapp $APP_DIR 2>/dev/null || chown -R $USER:$USER $APP_DIR
else
    log_error "Application files not found. Please run this script from the application directory."
    exit 1
fi

cd $APP_DIR

# Set up environment file
if [ ! -f .env ]; then
    log_step "Setting up environment configuration..."
    cp .env.example .env
    
    # Generate secure passwords
    MONGO_PASS=$(openssl rand -base64 32)
    DB_PASS=$(openssl rand -base64 32)
    JWT_SECRET=$(openssl rand -base64 64)
    
    # Update .env file
    sed -i "s/your_secure_mongo_password/$MONGO_PASS/" .env
    sed -i "s/your_secure_db_password/$DB_PASS/" .env
    sed -i "s/your_very_secure_jwt_secret_key_here/$JWT_SECRET/" .env
    
    # Get server IP
    SERVER_IP=$(hostname -I | awk '{print $1}')
    sed -i "s/your-domain.com/$SERVER_IP/" .env
    
    log_info "Environment configured with secure passwords"
fi

# Make scripts executable
chmod +x scripts/*.sh

# Start the application
log_step "Starting RV Classifieds application..."

# Choose deployment mode
echo ""
echo "Choose deployment mode:"
echo "1) Development (ports 3000, 8000, 27017)"
echo "2) Production (port 80 with nginx proxy)"
echo -n "Enter choice [1-2]: "
read choice

case $choice in
    2)
        log_info "Deploying in production mode..."
        docker-compose -f docker-compose.prod.yml up -d
        FRONTEND_URL="http://$SERVER_IP"
        ;;
    *)
        log_info "Deploying in development mode..."
        docker-compose up -d
        FRONTEND_URL="http://$SERVER_IP:3000"
        ;;
esac

# Wait for services to start
log_step "Waiting for services to initialize..."
sleep 20

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    log_info "✅ All services are running!"
else
    log_error "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Final success message
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        INSTALLATION COMPLETE!         ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
echo ""
log_info "🎉 RV Classifieds is now running!"
echo ""
echo "Access Information:"
echo "==================="
echo "🌐 Application: $FRONTEND_URL"
echo "🔧 API Documentation: $FRONTEND_URL/api/docs (development mode)"
echo "📊 API Health Check: $FRONTEND_URL/api/stats"
echo ""
echo "Application Directory: $APP_DIR"
echo ""
echo "Management Commands:"
echo "==================="
echo "📋 View logs: docker-compose logs -f"
echo "🔄 Restart: docker-compose restart"
echo "🛑 Stop: docker-compose down"
echo "📊 Status: docker-compose ps"
echo "💾 Backup: ./scripts/backup.sh"
echo ""

if [ "$EUID" -eq 0 ]; then
    echo -e "${YELLOW}Note: You may need to log out and log back in for Docker permissions to take effect${NC}"
    echo -e "${YELLOW}Or switch to the rvapp user: sudo su - rvapp${NC}"
fi

echo ""
log_info "Setup completed successfully!"
log_info "Visit $FRONTEND_URL to start using your RV Classifieds platform!"