#!/bin/bash

echo "🔧 RV Classifieds - Backend Connection Fix"
echo "=========================================="

echo "🚨 Problem erkannt:"
echo "   Frontend versucht localhost:8000 zu erreichen"
echo "   Backend läuft aber in Docker-Container"
echo ""

echo "✅ Lösung implementiert:"
echo "   - Relative API-URLs verwenden"
echo "   - Nginx-Proxy konfiguriert"
echo "   - Build-Args korrigiert"
echo ""

echo "🔄 Container neu starten..."
docker compose down

echo "🧹 Alte Images entfernen..."
docker rmi rv-listings_frontend 2>/dev/null || true
docker rmi rv-listings_backend 2>/dev/null || true

echo "🔨 Neu builden..."
docker compose build --no-cache

echo "🚀 Starten..."
docker compose up -d

echo ""
echo "⏳ Warten auf Container..."
sleep 25

echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "🔍 Netzwerk testen:"
echo "Backend erreichbar über nginx-proxy:"
curl -s http://localhost:8080/api/stats | grep -q "total" && echo "✅ Backend API: OK" || echo "❌ Backend API: Fehler"

echo ""
echo "Frontend JavaScript console prüfen:"
curl -s http://localhost:8080 | grep -q "RV Classifieds" && echo "✅ Frontend: OK" || echo "❌ Frontend: Fehler"

echo ""
echo "🎯 Test URL:"
echo "   http://localhost:8080"
echo "   http://localhost:8080/api/stats (Backend API)"
echo ""

echo "🐛 Debugging:"
echo "   Frontend logs: docker compose logs frontend"
echo "   Backend logs:  docker compose logs backend"
echo "   Browser Konsole: F12 → Console für JavaScript-Fehler"
echo ""

echo "✨ Nach dem Fix sollte die Registrierung funktionieren!"