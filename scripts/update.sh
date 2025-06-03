#!/bin/bash

# RV Classifieds Update Script

set -e

echo "🔄 Updating RV Classifieds Application"

# Create backup before update
echo "📦 Creating backup before update..."
./scripts/backup.sh

# Pull latest changes (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest changes..."
    git pull
fi

# Rebuild and restart services
echo "🔨 Rebuilding services..."
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Check health
if docker-compose ps | grep -q "Up"; then
    echo "✅ Update completed successfully!"
else
    echo "❌ Update failed. Check logs with: docker-compose logs"
    exit 1
fi
