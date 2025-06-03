# 🚐 RV Classifieds - Complete Docker Deployment Package

Your RV Classifieds application is now fully containerized and ready for deployment on any Ubuntu VPS! Here's everything you need to know:

## 📋 What You Have

✅ **Complete Docker Setup**
- Backend (FastAPI + Python)
- Frontend (React + Nginx)
- Database (MongoDB)
- Reverse proxy configuration
- SSL/HTTPS ready

✅ **Deployment Options**
- Development mode (quick testing)
- Production mode (with nginx proxy)
- Custom port configurations
- Multiple applications support

✅ **Management Scripts**
- One-command installation
- Automated backups
- Update procedures
- Health monitoring

## 🚀 Quick Deployment (3 Steps)

### Option 1: Complete Auto-Install
```bash
# On your Ubuntu VPS:
wget -O install.sh https://your-domain.com/scripts/quick-install.sh
chmod +x install.sh
sudo ./install.sh
```

### Option 2: Manual Upload
1. **Package the application** (on development machine):
```bash
./scripts/package.sh
# This creates: rv-classifieds-docker.tar.gz
```

2. **Upload to your VPS**:
```bash
scp rv-classifieds-docker.tar.gz user@your-vps:/opt/
```

3. **Deploy on VPS**:
```bash
cd /opt
tar -xzf rv-classifieds-docker.tar.gz
cd rv-classifieds-docker
sudo ./scripts/quick-install.sh
```

## 🔧 Customization for Multiple Apps

### Running on Custom Ports
Edit `docker-compose.yml` to avoid conflicts:

```yaml
services:
  frontend:
    ports:
      - "8080:80"    # Change from 3000 to 8080
  
  backend:
    ports:
      - "8001:8000"  # Change from 8000 to 8001
  
  mongodb:
    ports:
      - "27018:27017" # Change from 27017 to 27018
```

Update frontend configuration:
```bash
# Edit frontend/.env.production
REACT_APP_BACKEND_URL=http://your-domain:8001
```

### Using Different Domain/Subdomain
```bash
# Edit .env file
DOMAIN_NAME=rv.your-domain.com
```

### SSL/HTTPS Setup
1. Place SSL certificates in `ssl/` directory:
```bash
mkdir ssl
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

2. Uncomment HTTPS section in `nginx-proxy.conf`

## 📊 Monitoring & Management

### Service Status
```bash
docker-compose ps
docker-compose logs -f [service_name]
```

### Resource Usage
```bash
docker stats
docker system df
```

### Health Checks
- Frontend: `http://your-domain:3000`
- Backend API: `http://your-domain:8000/api/stats`
- Database: Internal only (secure)

## 💾 Backup & Restore

### Automated Backup
```bash
./scripts/backup.sh
# Creates timestamped backup in ./backups/
```

### Restore from Backup
```bash
./scripts/restore.sh backups/20231201_120000
```

## 🔒 Security Features

✅ **Implemented**
- MongoDB authentication
- JWT token security
- Password hashing (bcrypt)
- CORS configuration
- No exposed database ports (production)
- Input validation

🔧 **Recommended**
- Firewall setup (UFW)
- SSL certificates
- Regular updates
- Strong passwords (auto-generated)

## 🌐 Reverse Proxy Integration

The application works seamlessly with existing reverse proxies:

### Nginx (system-level)
```nginx
server {
    listen 80;
    server_name rv.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Apache
```apache
<VirtualHost *:80>
    ServerName rv.your-domain.com
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

### Traefik
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.rv-classifieds.rule=Host(`rv.your-domain.com`)"
```

## 📈 Scaling Options

### Horizontal Scaling
```bash
# Scale backend instances
docker-compose up -d --scale backend=3
```

### Load Balancer Configuration
Add to `nginx-proxy.conf`:
```nginx
upstream backend {
    server backend_1:8000;
    server backend_2:8000;
    server backend_3:8000;
}
```

## 🛠️ Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Ports | 3000, 8000, 27017 | 80, 443 |
| SSL | No | Yes (recommended) |
| Database Access | External | Internal only |
| Logging | Verbose | Structured |
| Performance | Debug mode | Optimized |

## 📞 Support & Troubleshooting

### Common Issues

**Port conflicts:**
```bash
sudo lsof -i :3000
# Change ports in docker-compose.yml
```

**Permission issues:**
```bash
sudo chown -R $USER:$USER /opt/rv-classifieds
```

**Memory issues:**
```bash
# Increase swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### Log Analysis
```bash
# View all logs
docker-compose logs

# Follow specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100
```

## 🎯 Next Steps

1. **Deploy and test** your application
2. **Configure domain/SSL** for production
3. **Set up monitoring** (optional)
4. **Create user accounts** and test functionality
5. **Add content** (vehicle listings)

## 📁 File Structure Reference

```
rv-classifieds-docker/
├── backend/              # FastAPI application
├── frontend/             # React application  
├── scripts/              # Management scripts
├── docker-compose.yml    # Development setup
├── docker-compose.prod.yml # Production setup
├── Dockerfile.backend    # Backend container
├── Dockerfile.frontend   # Frontend container
├── nginx.conf           # Frontend nginx config
├── nginx-proxy.conf     # Production proxy config
├── mongo-init.js        # Database initialization
├── .env.example         # Environment template
└── README.md           # This file
```

Your RV Classifieds platform is ready for deployment! 🎉