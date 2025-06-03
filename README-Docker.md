# 🚐 RV Classifieds - Complete Docker Deployment Package

Your specialized marketplace for caravans, motor homes, and camper vans is ready for deployment on any Ubuntu VPS!

## 🎯 Quick Start - Choose Your Deployment

### 🆕 New VPS (Fresh Server)
```bash
./scripts/one-click-deploy.sh
```
Perfect for: Dedicated RV marketplace server

### 🔄 Existing VPS (With Other Apps)  
```bash
./scripts/deploy-vps.sh
```
Perfect for: Adding RV marketplace to existing server

### 🏢 Multiple Marketplaces
```bash
./scripts/manage-domains.sh add rv.client1.com client1
```
Perfect for: Agencies hosting multiple clients

**Not sure which to use?** → See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)

## ✨ What You Get

🚐 **Complete RV Marketplace:**
- Specialized for caravans, motorhomes & camper vans
- User registration & authentication  
- Advanced search & filtering
- Interactive maps with route planning
- Image upload & galleries
- Seller contact system
- Location-based features

🐳 **Production-Ready Docker Setup:**
- Multi-domain support
- SSL certificates (Let's Encrypt)
- Reverse proxy integration
- Database persistence
- Automatic backups
- Health monitoring

## 📋 Supported Infrastructure

### Reverse Proxy Compatibility
- ✅ **Traefik** (automatic setup available)
- ✅ **nginx-proxy** (automatic setup available)  
- ✅ **Nginx Proxy Manager** (guided configuration)
- ✅ **Custom nginx/Apache** (configs provided)

### Domain Flexibility
```bash
# Single domain
rv-marketplace.com

# Subdomain
rv.yoursite.com

# Multiple brands
sunshine-rvs.com
mountain-campers.com
coast-motorhomes.com
```

## 🚀 Features Overview

### For RV Buyers
- 🔍 **Advanced Search** - Filter by type, price, year, location
- 🗺️ **Interactive Maps** - See listings on map with route planning
- 📱 **Mobile Responsive** - Perfect experience on all devices
- 📧 **Contact Sellers** - Secure messaging system
- 📍 **Location-Based** - Find RVs near you

### For RV Sellers  
- 📝 **Easy Listing Creation** - Simple form with image upload
- 🖼️ **Photo Galleries** - Multiple images per listing
- 📍 **Location Selection** - Click on map to set location
- 📞 **Contact Options** - Email + optional phone display
- 📊 **Listing Management** - View and manage your listings

### For Administrators
- 👥 **User Management** - JWT-based authentication
- 📊 **Statistics Dashboard** - Track listings and users
- 🔍 **Search Analytics** - Popular searches and filters
- 💾 **Data Management** - Automated backups
- 🔧 **Easy Maintenance** - Management scripts included

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) | **START HERE** - Choose your deployment method |
| [VPS-DEPLOYMENT.md](VPS-DEPLOYMENT.md) | Deploy on existing VPS with other apps |
| [MULTI-DOMAIN-GUIDE.md](MULTI-DOMAIN-GUIDE.md) | Advanced multi-domain configuration |
| [DOCKER-DEPLOYMENT.md](DOCKER-DEPLOYMENT.md) | Complete Docker reference |
| [QUICK-START.md](QUICK-START.md) | Simple 3-step deployment |

## 🔧 Management Commands

After deployment, manage your RV marketplace:

```bash
# Daily operations
./start-rv-classifieds.sh      # Start application
./stop-rv-classifieds.sh       # Stop application  
./restart-rv-classifieds.sh    # Restart application

# Monitoring & maintenance  
./logs-rv-classifieds.sh       # View logs
./health-rv-classifieds.sh     # Health check
./backup-rv-classifieds.sh     # Create backup

# Updates & scaling
./update-rv-classifieds.sh     # Update application
```

## 🏗️ Architecture

```
Internet (HTTPS)
      ↓
Reverse Proxy (Traefik/nginx)
      ↓
Docker Network
      ↓
┌─────────────────────────────────────┐
│         RV Classifieds              │
│  ┌──────────┐ ┌─────────────────────┐ │
│  │ Frontend │ │ Backend + Database  │ │
│  │ (React)  │ │ (FastAPI + MongoDB) │ │
│  └──────────┘ └─────────────────────┘ │
└─────────────────────────────────────────┘
```

## 💡 Use Cases

### RV Dealerships
- Showcase inventory online
- Manage customer inquiries  
- Location-based marketing
- Professional marketplace presence

### Individual Sellers
- Easy listing creation
- Photo galleries
- Secure buyer communication
- No technical knowledge required

### Hosting Companies
- Multi-client deployments
- Branded white-label solutions
- Scalable infrastructure
- Automated management

### Developers
- Open source codebase
- Docker containerization
- REST API included
- Customizable and extensible

## 🔒 Security & Performance

### Security Features
- 🔐 JWT authentication
- 🛡️ Network isolation  
- 🔑 Auto-generated secrets
- 📜 SSL certificates
- 🚫 No exposed databases

### Performance Optimized
- ⚡ React frontend with Nginx
- 🚀 FastAPI backend
- 📦 MongoDB database
- 🗜️ Gzip compression
- 📱 Mobile optimization

## 📊 Resource Requirements

### Minimum (Single Instance)
- **RAM**: 1GB
- **Disk**: 10GB SSD  
- **Network**: 1TB/month
- **CPU**: 1 core

### Recommended (Production)
- **RAM**: 2GB
- **Disk**: 20GB SSD
- **Network**: Unlimited
- **CPU**: 2 cores

### Multiple Instances
- **+500MB RAM** per additional marketplace
- **+2GB Disk** per additional marketplace
- Shared reverse proxy saves resources

## 🎉 Ready to Deploy!

Choose your deployment method and have your RV marketplace running in minutes:

1. **New server?** → `./scripts/one-click-deploy.sh`
2. **Existing server?** → `./scripts/deploy-vps.sh` 
3. **Multiple sites?** → `./scripts/manage-domains.sh`

Your specialized RV marketplace will be live with SSL, ready for users to start buying and selling recreational vehicles! 🚐✨
