#!/bin/bash

# Setup Traefik reverse proxy for multi-domain support

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

log_step "Setting up Traefik reverse proxy..."

# Create traefik directory
mkdir -p ./traefik

# Create traefik configuration
cat > ./traefik/traefik.yml << 'EOF'
api:
  dashboard: true
  debug: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: ${SSL_EMAIL}
      storage: acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: proxy
EOF

# Create docker-compose for Traefik
cat > ./traefik/docker-compose.traefik.yml << 'EOF'
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    command:
      - --configFile=/etc/traefik/traefik.yml
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Traefik dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml:ro
      - ./acme.json:/acme.json
    networks:
      - proxy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`traefik.${DOMAIN_NAME:-localhost}`)"
      - "traefik.http.routers.traefik.tls=true"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"

networks:
  proxy:
    external: true
EOF

# Create acme.json file with correct permissions
touch ./traefik/acme.json
chmod 600 ./traefik/acme.json

# Start Traefik
log_step "Starting Traefik..."
cd traefik
docker-compose -f docker-compose.traefik.yml up -d
cd ..

log_info "✅ Traefik started successfully!"
log_info "📊 Traefik dashboard will be available at: https://traefik.${DOMAIN_NAME:-your-domain.com}:8080"
