# 🚐 RV Classifieds - VPS Deployment with Existing Reverse Proxy

Deploy your RV Classifieds marketplace alongside other applications on your VPS with an existing reverse proxy setup.

## 🎯 Perfect for VPS with Existing Apps

This deployment method is ideal when you already have:
- ✅ Other Docker applications running
- ✅ Existing reverse proxy (Traefik, nginx-proxy, Nginx Proxy Manager)
- ✅ SSL certificates managed automatically
- ✅ Multiple domains on the same server

## 🚀 One-Command Deployment

```bash
./scripts/deploy-vps.sh
```

**What it does:**
1. 🔍 **Auto-detects** your existing reverse proxy setup
2. 🌐 **Configures** your domain and SSL settings
3. 🔧 **Generates** secure passwords and JWT secrets
4. 🐳 **Deploys** all containers with proper network isolation
5. 📋 **Creates** management scripts for easy maintenance
6. ✅ **Runs** health checks to verify everything works

## 📋 Supported Reverse Proxy Types

### 🔄 Traefik (Automatic)
- Auto-detects existing Traefik setup
- Configures container labels automatically
- SSL certificates via Let's Encrypt

### 🔄 nginx-proxy (Automatic)
- Auto-detects existing nginx-proxy + acme-companion
- Configures container environment variables
- SSL certificates via Let's Encrypt

### 🖥️ Nginx Proxy Manager (Guided Setup)
- Provides step-by-step NPM configuration
- Shows exact settings for Proxy Hosts
- SSL configuration instructions

### ⚙️ Custom/Manual (Configuration Provided)
- Works with any reverse proxy
- Provides example configurations
- Shows container names and ports

## 🌍 Multiple Domains Example

Deploy different RV marketplaces for different clients:

```bash
# Client 1
./scripts/deploy-vps.sh
# Domain: rv.client1.com

# Client 2  
./scripts/deploy-vps.sh
# Domain: rvs.client2.com

# Personal
./scripts/deploy-vps.sh
# Domain: campers.mysite.com
```

Each deployment is completely isolated with separate:
- Databases
- User accounts
- Listings
- SSL certificates

## 📊 Management Commands

After deployment, you get these management scripts:

```bash
# Daily operations
./start-rv-classifieds.sh      # Start the application
./stop-rv-classifieds.sh       # Stop the application  
./restart-rv-classifieds.sh    # Restart the application

# Monitoring & maintenance
./logs-rv-classifieds.sh       # View logs (add service name for specific logs)
./health-rv-classifieds.sh     # Run health checks
./backup-rv-classifieds.sh     # Create backups

# Updates
./update-rv-classifieds.sh     # Update application (with backup)
```

## 🔧 Technical Details

### Container Architecture
```
Your Domain (rv.yoursite.com)
        ↓
Existing Reverse Proxy
        ↓
Shared Network (proxy)
        ↓
┌─────────────────────────────────┐
│  RV Classifieds Application     │
│  ┌─────────┐ ┌─────────────────┐ │
│  │Frontend │ │Backend (FastAPI)│ │
│  │(React)  │ │+ MongoDB        │ │
│  │  :80    │ │    :8000        │ │
│  └─────────┘ └─────────────────┘ │
└─────────────────────────────────┘
```

### Resource Usage
- **RAM**: ~500MB per deployment
- **Disk**: ~2GB per deployment  
- **Network**: Shared with other apps
- **Ports**: No external ports (proxy handles routing)

### Security Features
- 🔒 Network isolation between applications
- 🔑 Auto-generated secure passwords
- 🛡️ No exposed database ports
- 📜 SSL certificates automatically managed
- 🔐 JWT-based authentication

## 🛠️ Advanced Configuration

### Custom Project Names
The script asks for a project name to avoid conflicts:
```bash
# Multiple instances
rv-client1, rv-client2, rv-personal
```

### Environment Customization
Edit `.env` after deployment for:
- Database names
- JWT secrets
- Network settings
- Domain configuration

### Scaling Options
```bash
# Scale backend instances
docker-compose -f docker-compose.multi-domain.yml up -d --scale backend=3

# Add more domains
./scripts/deploy-vps.sh  # Run again with different domain
```

## 🔍 Troubleshooting

### Check Application Status
```bash
./health-rv-classifieds.sh
```

### View Logs
```bash
./logs-rv-classifieds.sh           # All logs
./logs-rv-classifieds.sh backend   # Backend only
./logs-rv-classifieds.sh frontend  # Frontend only
```

### Common Issues

**Domain not working:**
```bash
# Check DNS
dig rv.yoursite.com

# Check reverse proxy
docker logs traefik  # or nginx-proxy
```

**Containers not starting:**
```bash
docker-compose -f docker-compose.multi-domain.yml ps
docker-compose -f docker-compose.multi-domain.yml logs
```

**Network issues:**
```bash
docker network ls | grep proxy
docker exec rv-classifieds-frontend ping rv-classifieds-backend
```

## 📞 Support

1. **Run health check**: `./health-rv-classifieds.sh`
2. **Check logs**: `./logs-rv-classifieds.sh`  
3. **Verify reverse proxy**: Check your proxy admin panel
4. **Test containers**: `docker-compose ps`

## 🎉 Ready to Deploy!

Your RV Classifieds marketplace will be live in minutes with this one-command deployment! Perfect for:

- 🏢 **Hosting companies** managing multiple client sites
- 🌐 **Multi-domain setups** with different brands
- 🔧 **Existing infrastructure** integration
- 📈 **Scalable solutions** for growing businesses

Run `./scripts/deploy-vps.sh` and start your RV marketplace today! 🚐✨