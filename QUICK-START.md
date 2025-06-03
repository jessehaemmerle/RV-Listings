# RV Classifieds - Quick Start with Docker

## 🚀 One-Command Deployment

Deploy the RV Classifieds application on your Ubuntu VPS with Docker:

### Prerequisites
- Ubuntu VPS (18.04+ recommended)
- At least 2GB RAM, 10GB disk space
- Root or sudo access

### Option 1: Auto-Install Everything
```bash
# Download and run the complete setup
curl -sSL https://raw.githubusercontent.com/your-repo/rv-classifieds/main/scripts/quick-install.sh | bash
```

### Option 2: Manual Setup

#### 1. Install Docker (if not already installed)
```bash
chmod +x scripts/install-docker.sh
./scripts/install-docker.sh
# Log out and log back in after installation
```

#### 2. Deploy Application
```bash
# Development mode (default)
./scripts/deploy.sh

# Production mode
./scripts/deploy.sh production
```

#### 3. Access Your Application
- **Frontend**: http://your-server-ip:3000
- **Backend API**: http://your-server-ip:8000/api/stats
- **Admin**: Use the registration form to create accounts

## 🔧 Configuration

### Environment Variables
Copy and edit the environment file:
```bash
cp .env.example .env
nano .env
```

Key settings:
- `DOMAIN_NAME`: Your domain (for production)
- `MONGO_ROOT_PASSWORD`: Secure MongoDB password
- `JWT_SECRET_KEY`: Secret for JWT tokens

### Custom Ports
To avoid conflicts with other applications, edit `docker-compose.yml`:
```yaml
services:
  frontend:
    ports:
      - "8080:80"  # Change from 3000 to 8080
  backend:
    ports:
      - "8001:8000"  # Change from 8000 to 8001
```

Then update frontend environment:
```bash
# Edit frontend/.env.production
REACT_APP_BACKEND_URL=http://your-domain:8001
```

## 📋 Management Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update application
./scripts/update.sh

# Backup data
./scripts/backup.sh

# View running services
docker-compose ps
```

## 🔒 Security (Production)

1. **Change all default passwords** in `.env`
2. **Set up SSL/HTTPS** (certificates in `ssl/` directory)
3. **Configure firewall**:
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 🆘 Troubleshooting

**Port conflicts:**
```bash
sudo lsof -i :3000  # Check what's using port 3000
# Change ports in docker-compose.yml
```

**Services not starting:**
```bash
docker-compose logs backend
docker-compose logs frontend
```

**Reset everything:**
```bash
docker-compose down -v  # Remove volumes too
docker-compose up -d
```

## 📞 Support

- Check logs: `docker-compose logs`
- View service status: `docker-compose ps`
- Test backend: `curl http://localhost:8000/api/stats`

For detailed documentation, see `README-Docker.md`.