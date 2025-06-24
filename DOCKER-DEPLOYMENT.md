# 🚐 RV Classifieds - Production Docker Deployment

Your RV Classifieds application is now production-ready with secure Docker containerization! 

## 🏗️ Architecture

**Multi-Container Setup:**
- **Frontend**: React app served by Nginx on port 80
- **Backend**: FastAPI application (internal, accessed via proxy)
- **Database**: MongoDB (internal only, secure)

**Security Features:**
- MongoDB not exposed externally
- Secure passwords and JWT tokens
- Nginx security headers
- Non-root user in backend container
- Health checks for all services

## 🚀 Quick Production Deployment

### Prerequisites
- Ubuntu/Debian server (18.04+ recommended)
- At least 2GB RAM, 10GB disk space
- Root or sudo access

### One-Command Deployment

```bash
# 1. Install Docker (if not already installed)
chmod +x scripts/install-docker.sh
./scripts/install-docker.sh
# Log out and log back in after installation

# 2. Deploy the application
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### Manual Deployment Steps

```bash
# 1. Build and start all services
docker compose up -d --build

# 2. Check service status
docker compose ps

# 3. View logs
docker compose logs -f
```

## 🌐 Access Your Application

- **Frontend**: http://your-server-ip (port 80)
- **Backend API**: http://your-server-ip/api/stats
- **Health Check**: All containers have built-in health monitoring

## 🔧 Configuration

### Environment Variables
Copy and customize the production environment:
```bash
cp .env.production .env
nano .env
```

**Important Settings to Change:**
```bash
# Database passwords (change these!)
MONGO_INITDB_ROOT_PASSWORD=YourSecurePassword123!
MONGO_PASSWORD=YourSecureDBUserPassword456!

# JWT Secret (generate a secure key)
JWT_SECRET_KEY=your-super-secure-jwt-secret-key-here

# Server settings
SERVER_NAME=your-domain.com
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
```

### Custom Domain Setup
1. **Point your domain** to your server IP
2. **Update environment**:
   ```bash
   SERVER_NAME=your-domain.com
   REACT_APP_BACKEND_URL=http://your-domain.com
   ```
3. **Restart services**:
   ```bash
   docker compose restart
   ```

## 🔒 SSL/HTTPS Setup (Recommended)

### Option 1: Nginx Proxy Manager (Easiest)
```bash
# Run alongside your app
docker run -d \
  --name=nginx-proxy-manager \
  -p 80:80 -p 443:443 -p 8181:81 \
  jc21/nginx-proxy-manager:latest

# Access at http://your-ip:8181
# Add your domain and get free SSL certificates
```

### Option 2: Let's Encrypt with Certbot
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Update docker-compose.yml to use SSL
```

## 📊 Management Commands

```bash
# View service status
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f backend
docker compose logs -f frontend

# Restart services
docker compose restart

# Update application
docker compose pull
docker compose up -d --build

# Stop application
docker compose down

# Complete cleanup (removes data!)
docker compose down -v
```

## 🔍 Monitoring & Health Checks

### Built-in Health Checks
- **Backend**: Checks `/api/stats` endpoint every 30s
- **Frontend**: Checks nginx status every 30s
- **MongoDB**: Docker health monitoring

### Manual Health Checks
```bash
# Test backend API
curl http://localhost/api/stats

# Test frontend
curl http://localhost/

# Check container health
docker compose ps
```

## 📈 Scaling & Performance

### Resource Monitoring
```bash
# View resource usage
docker stats

# View disk usage
docker system df

# Clean unused images/containers
docker system prune
```

### Scaling Backend
```bash
# Scale backend instances
docker compose up -d --scale backend=3

# Update nginx config for load balancing
```

## 💾 Backup & Data Management

### Database Backup
```bash
# Create backup
docker exec rv-classifieds-mongodb mongodump --db rv_classifieds --out /backup

# Restore backup
docker exec rv-classifieds-mongodb mongorestore --db rv_classifieds /backup/rv_classifieds
```

### Volume Backup
```bash
# Backup MongoDB data volume
docker run --rm -v rv-classifieds_mongodb_data:/source -v $(pwd)/backup:/backup alpine tar czf /backup/mongodb-backup.tar.gz -C /source .

# Restore volume
docker run --rm -v rv-classifieds_mongodb_data:/target -v $(pwd)/backup:/backup alpine tar xzf /backup/mongodb-backup.tar.gz -C /target
```

## 🛠️ Troubleshooting

### Common Issues

**Port 80 already in use:**
```bash
# Check what's using port 80
sudo lsof -i :80

# Stop conflicting service
sudo systemctl stop nginx  # or apache2

# Or change port in docker-compose.yml
ports:
  - "8080:80"  # Use port 8080 instead
```

**Containers not starting:**
```bash
# Check logs
docker compose logs

# Check system resources
free -h
df -h

# Restart Docker daemon
sudo systemctl restart docker
```

**Database connection issues:**
```bash
# Check MongoDB logs
docker compose logs mongodb

# Verify network connectivity
docker exec rv-classifieds-backend ping mongodb
```

### Log Analysis
```bash
# View all logs with timestamps
docker compose logs -t

# Follow logs from specific time
docker compose logs --since="2024-01-01T00:00:00Z"

# Export logs
docker compose logs > application.log
```

## 🔧 Advanced Configuration

### Reverse Proxy Integration
Works with existing reverse proxies:

**Nginx (system-level):**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8080;  # If using custom port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Traefik Labels:**
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.rv-classifieds.rule=Host(`your-domain.com`)"
  - "traefik.http.services.rv-classifieds.loadbalancer.server.port=80"
```

## 📋 Production Checklist

- [ ] Change all default passwords
- [ ] Set up SSL/HTTPS
- [ ] Configure firewall (allow ports 80, 443)
- [ ] Set up regular backups
- [ ] Configure monitoring
- [ ] Update SERVER_NAME and ALLOWED_HOSTS
- [ ] Test all functionality
- [ ] Set up log rotation
- [ ] Configure fail2ban (optional)

## 📞 Support

Your RV Classifieds platform is production-ready! 🎉

For issues:
1. Check logs: `docker compose logs`
2. Verify service status: `docker compose ps`
3. Test endpoints manually
4. Check system resources