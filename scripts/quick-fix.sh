#!/bin/bash

echo "🚐 RV Classifieds - Quick Docker Fix"
echo "===================================="

echo "📦 Lockfile-Fehler behoben!"
echo "   - Babel-Abhängigkeit entfernt"
echo "   - yarn.lock aktualisiert"
echo "   - Docker Build sollte jetzt funktionieren"
echo ""

echo "🔄 Container neu starten..."
docker compose down
docker compose build --no-cache
docker compose up -d

echo ""
echo "⏳ Warten auf Container..."
sleep 20

echo ""
echo "📊 Container Status:"
docker compose ps

echo ""
echo "🧪 Health Check:"
sleep 5
curl -f http://localhost:8080/api/stats >/dev/null 2>&1 && echo "✅ Backend: OK" || echo "❌ Backend: Fehler"
curl -f http://localhost:8080 >/dev/null 2>&1 && echo "✅ Frontend: OK" || echo "❌ Frontend: Fehler"

echo ""
echo "🎉 Deutsche Wohnmobil-Kleinanzeigen bereit!"
echo "   🌐 http://your-server-ip:8080"
echo "   🇩🇪 Vollständig auf Deutsch"
echo "   👤 Benutzer können sich registrieren"
echo "   🚐 Wohnmobile zum Verkauf anbieten"
echo ""
echo "📋 Nächste Schritte:"
echo "   1. Website öffnen: http://your-server-ip:8080"
echo "   2. Account registrieren"
echo "   3. Erste Anzeige erstellen"