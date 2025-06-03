# RV Classifieds - Docker Deployment Guide

This guide will help you deploy the RV Classifieds application on your Ubuntu VPS using Docker.

## Prerequisites

- Ubuntu VPS with Docker and Docker Compose installed
- At least 2GB RAM and 10GB disk space
- Domain name (optional, for HTTPS)

## Quick Start (Development)

1. **Clone/Copy the application files to your VPS:**
```bash
# Create directory for the application
mkdir -p /opt/rv-classifieds
cd /opt/rv-classifieds

# Copy all application files here
```

2. **Start the application:**
```bash
docker-compose up -d
```

3. **Access the application:**
- Frontend: http://your-server-ip:3000
- Backend API: http://your-server-ip:8000
- MongoDB: localhost:27017 (accessible only locally)

## Production Deployment

### 1. Environment Setup

Copy and configure environment variables:
```bash
cp .env.example .env
nano .env
```

Update the following in `.env`:
```bash
MONGO_ROOT_PASSWORD=your_very_secure_password
DB_PASSWORD=your_secure_db_password
DOMAIN_NAME=your-domain.com
JWT_SECRET_KEY=your_super_secure_jwt_secret
```

### 2. Frontend Configuration

Update the backend URL for your domain:
```bash
# Edit frontend/.env.production
REACT_APP_BACKEND_URL=https://your-domain.com
```

### 3. Deploy with Production Configuration

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 4. SSL Setup (Optional but Recommended)

For HTTPS, place your SSL certificates in the `ssl/` directory:
```bash
mkdir ssl
# Copy your SSL certificate and key
cp your-cert.pem ssl/cert.pem
cp your-key.pem ssl/key.pem
```

Then uncomment the HTTPS server block in `nginx-proxy.conf`.

## Service Management

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Restart services:
```bash
# All services
docker-compose restart

# Specific service
docker-compose restart backend
```

### Stop services:
```bash
docker-compose down
```

### Update application:
```bash
# Pull latest changes and rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Port Configuration

### Default Ports (Development):
- Frontend: 3000
- Backend: 8000
- MongoDB: 27017

### Production Ports:
- HTTP: 80
- HTTPS: 443 (if SSL configured)
- MongoDB: Not exposed (internal only)

## Customizing Ports

To run on different ports (useful for multiple applications):

1. **Edit docker-compose.yml:**
```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change 3000 to 8080
  
  backend:
    ports:
      - "8001:8000"  # Change 8000 to 8001
```

2. **Update environment variables:**
```bash
REACT_APP_BACKEND_URL=http://your-domain:8001
```

## Database Backup

### Backup:
```bash
docker exec rv-classifieds-mongodb mongodump --username admin --password password123 --authenticationDatabase admin --db rv_classifieds --out /backup
docker cp rv-classifieds-mongodb:/backup ./backup
```

### Restore:
```bash
docker cp ./backup rv-classifieds-mongodb:/backup
docker exec rv-classifieds-mongodb mongorestore --username admin --password password123 --authenticationDatabase admin --db rv_classifieds /backup/rv_classifieds
```

## Monitoring

### Check service health:
```bash
docker-compose ps
```

### Resource usage:
```bash
docker stats
```

### Disk usage:
```bash
docker system df
```

## Troubleshooting

### Common Issues:

1. **Port already in use:**
```bash
# Check what's using the port
sudo lsof -i :3000
# Change ports in docker-compose.yml
```

2. **MongoDB connection issues:**
```bash
# Check MongoDB logs
docker-compose logs mongodb
# Verify network connectivity
docker-compose exec backend ping mongodb
```

3. **Frontend can't reach backend:**
```bash
# Check backend health
curl http://localhost:8000/api/stats
# Verify REACT_APP_BACKEND_URL is correct
```

4. **Permission issues:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x scripts/*.sh
```

## Security Considerations

1. **Change default passwords** in `.env`
2. **Use HTTPS** in production
3. **Don't expose MongoDB port** in production
4. **Regular updates:**
```bash
docker-compose pull
docker-compose up -d
```

## Scaling

For high traffic, you can scale individual services:
```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Add load balancer configuration to nginx
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Verify configurations in `.env` and nginx files
3. Test individual services: `docker-compose ps`
