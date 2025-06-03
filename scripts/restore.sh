#!/bin/bash

# RV Classifieds Restore Script

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <backup_directory>"
    echo "Available backups:"
    ls -la backups/
    exit 1
fi

BACKUP_DIR=$1

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup directory $BACKUP_DIR does not exist"
    exit 1
fi

echo "🔄 Restoring from $BACKUP_DIR"

# Restore MongoDB
if [ -d "$BACKUP_DIR/mongodb" ]; then
    echo "📦 Restoring MongoDB..."
    docker cp $BACKUP_DIR/mongodb rv-classifieds-mongodb:/backup
    docker exec rv-classifieds-mongodb mongorestore \
        --username admin \
        --password password123 \
        --authenticationDatabase admin \
        --db rv_classifieds \
        --drop \
        /backup
    echo "✅ MongoDB restored"
else
    echo "⚠️  No MongoDB backup found in $BACKUP_DIR"
fi

echo "✅ Restore completed"
