#!/bin/bash

echo "🔧 RV Classifieds Docker Fix Script"
echo "==================================="

echo "1. Stopping all containers..."
docker compose down

echo "2. Removing old containers..."
docker container prune -f

echo "3. Rebuilding containers..."
docker compose build --no-cache

echo "4. Starting containers..."
docker compose up -d

echo "5. Waiting for containers to start..."
sleep 30

echo "6. Checking status..."
docker compose ps

echo "7. Testing backend health..."
sleep 10
curl -f http://localhost:8080/api/stats && echo "✅ Backend is working!" || echo "❌ Backend still not responding"

echo "8. Testing frontend..."
curl -f http://localhost:8080 && echo "✅ Frontend is working!" || echo "❌ Frontend still not responding"

echo ""
echo "🎉 Fix attempt complete!"
echo "Try accessing: http://your-server-ip:8080"
echo ""
echo "🚐 Deutsche Wohnmobil-Kleinanzeigen sind bereit!"
echo "   Benutzer können sich registrieren und Anzeigen erstellen."