#!/bin/bash

# Domain management script for multiple RV Classifieds instances

set -e

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

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║         MULTI-DOMAIN MANAGER              ║
║         RV Classifieds                    ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

show_help() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  list                    List all RV Classifieds instances"
    echo "  add <domain> <name>     Add new instance"
    echo "  remove <name>           Remove instance"
    echo "  status <name>           Check instance status"
    echo "  update <name>           Update instance"
    echo "  backup <name>           Backup instance"
    echo ""
    echo "Examples:"
    echo "  $0 add rv.company1.com company1"
    echo "  $0 add rvs.company2.com company2"
    echo "  $0 list"
    echo "  $0 status company1"
}

list_instances() {
    echo "Active RV Classifieds Instances:"
    echo "==============================="
    
    # Find all containers with rv-classifieds pattern
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "rv-classifieds\|rv_classifieds" || echo "No instances found"
    
    echo ""
    echo "Networks:"
    docker network ls | grep proxy || echo "No proxy network found"
}

add_instance() {
    local domain=$1
    local name=$2
    
    if [ -z "$domain" ] || [ -z "$name" ]; then
        echo "Usage: $0 add <domain> <name>"
        exit 1
    fi
    
    log_step "Adding new RV Classifieds instance: $name ($domain)"
    
    # Create instance directory
    INSTANCE_DIR="instances/$name"
    mkdir -p "$INSTANCE_DIR"
    
    # Copy configuration files
    cp docker-compose.multi-domain.yml "$INSTANCE_DIR/"
    cp -r backend "$INSTANCE_DIR/"
    cp -r frontend "$INSTANCE_DIR/"
    cp Dockerfile.* "$INSTANCE_DIR/"
    cp nginx-multi-domain.conf "$INSTANCE_DIR/"
    cp mongo-init.js "$INSTANCE_DIR/"
    
    # Create environment file
    cat > "$INSTANCE_DIR/.env" << EOF
COMPOSE_PROJECT_NAME=$name
DOMAIN_NAME=$domain
SSL_EMAIL=admin@$domain
DB_NAME=${name}_db
MONGO_ROOT_PASSWORD=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET_KEY=$(openssl rand -base64 64)
REVERSE_PROXY_NETWORK=proxy
EOF
    
    # Deploy instance
    cd "$INSTANCE_DIR"
    docker-compose -f docker-compose.multi-domain.yml up -d --build
    cd ../..
    
    log_info "✅ Instance '$name' created and deployed!"
    log_info "🌐 Access at: https://$domain"
}

remove_instance() {
    local name=$1
    
    if [ -z "$name" ]; then
        echo "Usage: $0 remove <name>"
        exit 1
    fi
    
    log_warn "Removing RV Classifieds instance: $name"
    
    INSTANCE_DIR="instances/$name"
    
    if [ ! -d "$INSTANCE_DIR" ]; then
        echo "Instance '$name' not found"
        exit 1
    fi
    
    # Stop and remove containers
    cd "$INSTANCE_DIR"
    docker-compose -f docker-compose.multi-domain.yml down -v
    cd ../..
    
    # Backup before removal
    tar -czf "instances/$name.backup.$(date +%Y%m%d_%H%M%S).tar.gz" "$INSTANCE_DIR"
    
    # Remove directory
    rm -rf "$INSTANCE_DIR"
    
    log_info "✅ Instance '$name' removed (backup created)"
}

status_instance() {
    local name=$1
    
    if [ -z "$name" ]; then
        echo "Usage: $0 status <name>"
        exit 1
    fi
    
    INSTANCE_DIR="instances/$name"
    
    if [ ! -d "$INSTANCE_DIR" ]; then
        echo "Instance '$name' not found"
        exit 1
    fi
    
    cd "$INSTANCE_DIR"
    
    echo "Status for instance: $name"
    echo "=========================="
    
    # Load environment
    source .env
    
    echo "Domain: $DOMAIN_NAME"
    echo "Project: $COMPOSE_PROJECT_NAME"
    echo ""
    
    # Container status
    docker-compose -f docker-compose.multi-domain.yml ps
    
    cd ../..
}

update_instance() {
    local name=$1
    
    if [ -z "$name" ]; then
        echo "Usage: $0 update <name>"
        exit 1
    fi
    
    INSTANCE_DIR="instances/$name"
    
    if [ ! -d "$INSTANCE_DIR" ]; then
        echo "Instance '$name' not found"
        exit 1
    fi
    
    log_step "Updating instance: $name"
    
    cd "$INSTANCE_DIR"
    
    # Backup first
    ../../../scripts/backup.sh
    
    # Pull and rebuild
    docker-compose -f docker-compose.multi-domain.yml pull
    docker-compose -f docker-compose.multi-domain.yml up -d --build
    
    log_info "✅ Instance '$name' updated"
    
    cd ../..
}

backup_instance() {
    local name=$1
    
    if [ -z "$name" ]; then
        echo "Usage: $0 backup <name>"
        exit 1
    fi
    
    INSTANCE_DIR="instances/$name"
    
    if [ ! -d "$INSTANCE_DIR" ]; then
        echo "Instance '$name' not found"
        exit 1
    fi
    
    log_step "Backing up instance: $name"
    
    cd "$INSTANCE_DIR"
    ../../scripts/backup.sh
    cd ../..
    
    log_info "✅ Instance '$name' backed up"
}

# Main command handler
case "$1" in
    "list")
        list_instances
        ;;
    "add")
        add_instance "$2" "$3"
        ;;
    "remove")
        remove_instance "$2"
        ;;
    "status")
        status_instance "$2"
        ;;
    "update")
        update_instance "$2"
        ;;
    "backup")
        backup_instance "$2"
        ;;
    *)
        show_help
        exit 1
        ;;
esac
