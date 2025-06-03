#!/bin/bash

# RV Classifieds Backup Script

set -e

BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

echo "🔄 Creating backup in $BACKUP_DIR"

# Backup MongoDB
echo "📦 Backing up MongoDB..."
docker exec rv-classifieds-mongodb mongodump \
    --username admin \
    --password password123 \
    --authenticationDatabase admin \
    --db rv_classifieds \
    --out /backup

docker cp rv-classifieds-mongodb:/backup/rv_classifieds $BACKUP_DIR/mongodb

# Backup application files
echo "📁 Backing up application files..."
tar -czf $BACKUP_DIR/app_files.tar.gz \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=backups \
    .

echo "✅ Backup completed: $BACKUP_DIR"
echo "📊 Backup size: $(du -sh $BACKUP_DIR)"
