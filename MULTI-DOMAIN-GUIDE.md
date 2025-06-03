# 🌐 RV Classifieds Multi-Domain Deployment Guide

Deploy your RV Classifieds application alongside other Docker containers with different domains on your Ubuntu VPS.

## 🎯 Overview

This setup allows you to:
- Run multiple applications on the same VPS with different domains
- Share a single reverse proxy (Traefik, nginx-proxy, etc.)
- Automatically manage SSL certificates
- Isolate applications while sharing infrastructure

## 🚀 Quick Start

### Option 1: Automated Setup
```bash
./scripts/setup-multi-domain.sh
```

### Option 2: Manual Setup

#### 1. Create Proxy Network (shared with other apps)
```bash
docker network create proxy
```

#### 2. Configure Environment
```bash
cp .env.multi-domain .env
nano .env  # Edit with your domain and settings
```

#### 3. Deploy Application
```bash
docker-compose -f docker-compose.multi-domain.yml up -d
```

## 🔧 Configuration Options

### Environment Variables (.env)
```bash
# Your domain
DOMAIN_NAME=rv.your-domain.com

# Project name (avoid conflicts)
COMPOSE_PROJECT_NAME=rv-classifieds

# SSL email for Let's Encrypt
SSL_EMAIL=admin@your-domain.com

# Shared network name
REVERSE_PROXY_NETWORK=proxy

# Database settings
DB_NAME=rv_classifieds
MONGO_ROOT_PASSWORD=secure_password
DB_PASSWORD=secure_password
JWT_SECRET_KEY=super_secure_jwt_secret
```

## 🌐 Reverse Proxy Integration

### Traefik (Recommended)

**Automatic Setup:**
```bash
./scripts/setup-traefik.sh
```

**Manual Setup:**
```yaml
# traefik.yml
entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@domain.com
      storage: acme.json
      httpChallenge:
        entryPoint: web
```

### nginx-proxy + Let's Encrypt

**Setup:**
```bash
./scripts/setup-nginx-proxy.sh
```

### Nginx Proxy Manager

1. Install NPM on your VPS
2. Add new Proxy Host:
   - Domain: `rv.your-domain.com`
   - Forward Hostname: `rv-classifieds-frontend`
   - Forward Port: `80`
3. Enable SSL with Let's Encrypt

### Custom Nginx

**System-level nginx configuration:**
```nginx
server {
    listen 80;
    server_name rv.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rv.your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🔗 Multiple Applications Example

```bash
# App 1: RV Classifieds
DOMAIN_NAME=rv.mysite.com
COMPOSE_PROJECT_NAME=rv-classifieds

# App 2: Blog
DOMAIN_NAME=blog.mysite.com  
COMPOSE_PROJECT_NAME=my-blog

# App 3: E-commerce
DOMAIN_NAME=shop.mysite.com
COMPOSE_PROJECT_NAME=my-shop
```

All apps share the same `proxy` network and reverse proxy.

## 📊 Container Architecture

```
┌─────────────────────────────────────┐
│           Reverse Proxy             │
│      (Traefik/nginx-proxy)          │
│         Port 80/443                 │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │   Proxy Network   │
        └─────────┬─────────┘
                  │
┌─────────────────┼─────────────────────┐
│                 │                     │
│  ┌──────────────▼─────────────────┐   │
│  │        RV Classifieds          │   │
│  │  ┌──────────┐ ┌──────────────┐ │   │
│  │  │Frontend  │ │   Backend    │ │   │
│  │  │(React)   │ │  (FastAPI)   │ │   │
│  │  └──────────┘ └──────┬───────┘ │   │
│  │                     │         │   │
│  │  ┌──────────────────▼───────┐ │   │
│  │  │      MongoDB            │ │   │
│  │  └──────────────────────────┘ │   │
│  └────────────────────────────────┘   │
│              Internal Network          │
└────────────────────────────────────────┘
```

## 🔒 Security Features

- **Network Isolation**: Apps run in separate internal networks
- **No External Ports**: Only reverse proxy exposes ports 80/443
- **SSL Termination**: Automatic HTTPS with Let's Encrypt
- **Security Headers**: Added by reverse proxy
- **Database Protection**: MongoDB not exposed externally

## 📋 Management Commands

```bash
# View logs
docker-compose -f docker-compose.multi-domain.yml logs -f

# Restart application
docker-compose -f docker-compose.multi-domain.yml restart

# Stop application
docker-compose -f docker-compose.multi-domain.yml down

# Update application
docker-compose -f docker-compose.multi-domain.yml pull
docker-compose -f docker-compose.multi-domain.yml up -d

# Scale backend
docker-compose -f docker-compose.multi-domain.yml up -d --scale backend=3
```

## 🌍 DNS Configuration

Point your domain to your VPS:
```
A record: rv.your-domain.com → YOUR_VPS_IP
```

For multiple subdomains:
```
A record: rv.your-domain.com → YOUR_VPS_IP
A record: blog.your-domain.com → YOUR_VPS_IP
A record: shop.your-domain.com → YOUR_VPS_IP
```

## 🔧 Troubleshooting

### Common Issues

**1. Domain not working:**
```bash
# Check DNS
dig rv.your-domain.com

# Check containers
docker-compose -f docker-compose.multi-domain.yml ps

# Check reverse proxy logs
docker logs traefik
# or
docker logs nginx-proxy
```

**2. SSL certificate issues:**
```bash
# Traefik: Check certificate generation
docker logs traefik | grep certificate

# nginx-proxy: Check acme companion
docker logs nginx-proxy-acme
```

**3. Network connectivity:**
```bash
# Test internal connectivity
docker exec rv-classifieds-frontend ping rv-classifieds-backend
docker exec rv-classifieds-backend ping mongodb
```

**4. Port conflicts:**
```bash
# Check what's using ports
sudo lsof -i :80
sudo lsof -i :443

# Make sure only reverse proxy uses these ports
```

## 🚀 Advanced Configuration

### Custom Base Path
To run under a path like `domain.com/rv-classifieds`:

```bash
# In .env
BASE_PATH=/rv-classifieds
```

### Health Checks
```bash
# Frontend health
curl https://rv.your-domain.com/health

# Backend health  
curl https://rv.your-domain.com/api/stats
```

### Monitoring
Add monitoring labels:
```yaml
labels:
  - "prometheus.io/scrape=true"
  - "prometheus.io/port=8000"
```

## 📞 Support

**Check application status:**
```bash
./scripts/health-check.sh
```

**Backup before changes:**
```bash
./scripts/backup.sh
```

**View all containers:**
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

Your RV Classifieds application is now ready to run alongside other applications with proper domain isolation! 🎉
