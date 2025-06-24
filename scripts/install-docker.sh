#!/bin/bash

# Docker Installation Script for Ubuntu/Debian
# Updated for Docker Compose V2 and modern Docker

set -e

echo "🐳 Installing Docker and Docker Compose V2"

# Detect OS
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$ID
    DISTRO=$VERSION_CODENAME
else
    echo "❌ Cannot detect OS. This script supports Ubuntu/Debian only."
    exit 1
fi

# Update package index
echo "📦 Updating package index..."
sudo apt-get update

# Install prerequisites
echo "🔧 Installing prerequisites..."
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
echo "🔑 Adding Docker GPG key..."
curl -fsSL https://download.docker.com/linux/$OS/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up the stable repository
echo "📋 Setting up Docker repository..."
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/$OS \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update package index again
echo "📦 Updating package index with Docker repository..."
sudo apt-get update

# Install Docker Engine (includes Docker Compose V2)
echo "🚀 Installing Docker Engine..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
echo "👤 Adding user to docker group..."
sudo usermod -aG docker $USER

# Start and enable Docker service
echo "🔄 Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Verify installation
echo "✅ Verifying Docker installation..."
docker --version
docker compose version

echo ""
echo "✅ Docker and Docker Compose V2 installed successfully!"
echo "⚠️  Please log out and log back in for group changes to take effect"
echo "🔍 Use 'docker compose' (not 'docker-compose') for Docker Compose V2"
echo ""
echo "🚀 To start your application:"
echo "   docker compose up -d"
echo ""
echo "📊 To check running containers:"
echo "   docker compose ps"
