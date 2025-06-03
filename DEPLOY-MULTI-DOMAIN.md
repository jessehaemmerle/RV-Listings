# 🌐 RV Classifieds - Multi-Domain Docker Deployment

## 🎯 Perfect for Multiple Domains on One VPS!

Your RV Classifieds application is now configured to run alongside other Docker containers with different domains on your Ubuntu VPS.

## 🚀 Super Quick Deploy (One Command!)

```bash
./scripts/one-click-deploy.sh
```

That's it! The script will:
- ✅ Install Docker/Docker Compose if needed
- ✅ Set up reverse proxy (Traefik or nginx-proxy)
- ✅ Configure SSL certificates automatically
- ✅ Deploy your RV marketplace
- ✅ Run health checks

## 🌍 Multiple Domain Examples

Run several instances on the same VPS:

```bash
# Company 1: RV marketplace
rv.company1.com

# Company 2: Different RV marketplace  
rvs.company2.com

# Personal: Your own RV site
campers.mysite.com
```

Each runs independently with its own:
- Database
- SSL certificate
- User accounts
- Listings

## 🔧 Manual Setup (Advanced Users)

### 1. Quick Setup with Script
```bash
./scripts/setup-multi-domain.sh
```

### 2. Or step-by-step:

**Create shared network:**
```bash
docker network create proxy
```

**Configure environment:**
```bash
cp .env.multi-domain .env
nano .env  # Edit your domain and settings
```

**Deploy:**
```bash
docker-compose -f docker-compose.multi-domain.yml up -d
```

## 🌐 Reverse Proxy Integration

### Works with ANY reverse proxy:

**Traefik (Auto-setup):**
```bash
./scripts/setup-traefik.sh
```

**nginx-proxy (Auto-setup):**
```bash
./scripts/setup-nginx-proxy.sh
```

**Nginx Proxy Manager:** Use the web UI with these settings:
- Domain: `rv.your-domain.com`
- Forward to: `rv-classifieds-frontend:80`

**Custom nginx/Apache:** Configuration files provided in `reverse-proxy-configs/`

## 📋 Management Commands

```bash
# Deploy new domain
./scripts/manage-domains.sh add rv.newclient.com newclient

# List all instances
./scripts/manage-domains.sh list

# Check health
./scripts/health-check.sh

# View logs
docker-compose -f docker-compose.multi-domain.yml logs -f

# Backup data
./scripts/backup.sh
```

## 🏗️ Architecture

```
Internet
    ↓
Reverse Proxy (port 80/443)
    ↓
Docker Network: "proxy"
    ↓
┌─────────────────────────────────────────┐
│ RV Classifieds (your-domain.com)        │
│ ┌─────────┐ ┌─────────┐ ┌─────────────┐ │
│ │Frontend │ │Backend  │ │  MongoDB    │ │
│ │ :80     │ │ :8000   │ │  :27017     │ │
│ └─────────┘ └─────────┘ └─────────────┘ │
└─────────────────────────────────────────┘
```

## 🔒 Security Features

- ✅ **Network Isolation**: Apps can't interfere with each other
- ✅ **No External Database Ports**: MongoDB only accessible internally
- ✅ **Automatic SSL**: Let's Encrypt certificates
- ✅ **Secure Passwords**: Auto-generated strong passwords
- ✅ **JWT Authentication**: Secure user sessions

## 📊 Resource Usage

**Minimal Resources:**
- ~500MB RAM per instance
- ~2GB disk space per instance
- Shared reverse proxy (saves resources)

**Perfect for:**
- Hosting multiple client sites
- Different brands/companies
- Testing and production environments
- Multi-tenant setups

## 🛠️ Customization

### Different Ports (if needed):
```yaml
# docker-compose.multi-domain.yml
services:
  frontend:
    ports:
      - "8080:80"  # Custom port
```

### Custom Domains:
```bash
# Add subdomain
rv.yoursite.com

# Add separate domain
anothersite.com

# Add path-based
yoursite.com/rv-classifieds
```

### Branding:
- Each instance can have different:
  - Colors/themes
  - Company names
  - Contact information
  - Terms of service

## 🎯 Production Ready

### What You Get:
- **Zero-downtime deployments**
- **Automatic backups**
- **Health monitoring**
- **SSL certificates**
- **Database persistence**
- **Container orchestration**
- **Resource monitoring**

### Scaling Options:
```bash
# Scale backend instances
docker-compose -f docker-compose.multi-domain.yml up -d --scale backend=3

# Add more domains
./scripts/manage-domains.sh add new-domain.com newproject
```

## 📞 Support & Troubleshooting

### Health Check:
```bash
./scripts/health-check.sh
```

### Common Issues:
```bash
# DNS not pointing to server
dig your-domain.com

# Container issues
docker-compose -f docker-compose.multi-domain.yml ps

# Network issues
docker network ls | grep proxy

# SSL issues (Traefik)
docker logs traefik | grep certificate
```

### Emergency Recovery:
```bash
# Restore from backup
./scripts/restore.sh backups/20231201_120000

# Reset everything
docker-compose -f docker-compose.multi-domain.yml down -v
docker-compose -f docker-compose.multi-domain.yml up -d
```

## 🎉 Ready to Deploy!

Your RV Classifieds application is now configured to run seamlessly alongside other applications on your VPS with different domains. 

**Just run:**
```bash
./scripts/one-click-deploy.sh
```

And you'll have a fully functional, SSL-secured RV marketplace running at your domain in minutes! 🚐✨