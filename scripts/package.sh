#!/bin/bash

# Package RV Classifieds for distribution

set -e

echo "📦 Packaging RV Classifieds for Docker deployment..."

# Create distribution directory
DIST_DIR="rv-classifieds-docker"
rm -rf $DIST_DIR
mkdir -p $DIST_DIR

# Copy necessary files
cp -r backend $DIST_DIR/
cp -r frontend $DIST_DIR/
cp -r scripts $DIST_DIR/
cp Dockerfile.* $DIST_DIR/
cp docker-compose*.yml $DIST_DIR/
cp nginx*.conf $DIST_DIR/
cp mongo-init.js $DIST_DIR/
cp .env.example $DIST_DIR/
cp .dockerignore $DIST_DIR/
cp README-Docker.md $DIST_DIR/README.md
cp QUICK-START.md $DIST_DIR/

# Remove development files from distribution
rm -rf $DIST_DIR/backend/__pycache__
rm -rf $DIST_DIR/frontend/node_modules
rm -rf $DIST_DIR/frontend/build
find $DIST_DIR -name "*.pyc" -delete
find $DIST_DIR -name ".DS_Store" -delete

# Create archive
tar -czf rv-classifieds-docker.tar.gz $DIST_DIR

echo "✅ Package created: rv-classifieds-docker.tar.gz"
echo "📁 Distribution directory: $DIST_DIR"
echo ""
echo "To deploy on Ubuntu VPS:"
echo "1. Copy rv-classifieds-docker.tar.gz to your server"
echo "2. Extract: tar -xzf rv-classifieds-docker.tar.gz"
echo "3. cd rv-classifieds-docker"
echo "4. ./scripts/quick-install.sh"