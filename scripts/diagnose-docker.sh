#!/bin/bash

echo "🔍 RV Classifieds Docker Diagnostic Script"
echo "=========================================="

echo "📊 Container Status:"
docker compose ps
echo ""

echo "🌐 Network Information:"
docker network ls | grep rv
echo ""

echo "🔍 Testing Backend Health:"
echo "Testing backend from host..."
curl -s http://localhost:8080/api/stats || echo "❌ Backend not accessible from host"
echo ""

echo "Testing backend from within backend container..."
docker exec rv-classifieds-backend curl -s http://localhost:8000/api/stats || echo "❌ Backend not responding internally"
echo ""

echo "Testing backend from frontend container..."
docker exec rv-classifieds-frontend curl -s http://backend:8000/api/stats || echo "❌ Backend not accessible from frontend"
echo ""

echo "🔍 Testing Frontend:"
echo "Testing frontend from host..."
curl -s -I http://localhost:8080 || echo "❌ Frontend not accessible from host"
echo ""

echo "📋 Container Logs (Last 20 lines):"
echo "--- Backend Logs ---"
docker compose logs --tail=20 backend
echo ""
echo "--- Frontend Logs ---"
docker compose logs --tail=20 frontend
echo ""
echo "--- MongoDB Logs ---"
docker compose logs --tail=20 mongodb
echo ""

echo "🔧 Port Information:"
ss -tulpn | grep ':8080\|:8000\|:27017' || echo "No relevant ports found"
echo ""

echo "💾 Memory and Disk Usage:"
docker stats --no-stream
echo ""

echo "📁 Volume Information:"
docker volume ls | grep rv-classifieds
echo ""

echo "Diagnostic complete! Please share this output for further assistance."