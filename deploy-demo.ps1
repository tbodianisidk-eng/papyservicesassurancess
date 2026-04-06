# Script de déploiement pour démonstration
Write-Host "🚀 Déploiement de Assurance Santé Connect..." -ForegroundColor Green

# 1. Démarrer le backend
Write-Host "📡 Démarrage du backend..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd backend; mvn spring-boot:run" -WindowStyle Normal

# Attendre que le backend démarre
Start-Sleep -Seconds 15

# 2. Démarrer le frontend
Write-Host "🎨 Démarrage du frontend..." -ForegroundColor Yellow
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

# Attendre que le frontend démarre
Start-Sleep -Seconds 10

# 3. Créer les tunnels
Write-Host "🌐 Création des tunnels publics..." -ForegroundColor Yellow

# Tunnel pour le backend (port 3001)
Write-Host "📡 Création du tunnel backend..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/c", "lt --port 3001 --subdomain assurance-backend-demo" -WindowStyle Normal

# Tunnel pour le frontend (port 5173)
Write-Host "🎨 Création du tunnel frontend..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/c", "lt --port 5173 --subdomain assurance-frontend-demo" -WindowStyle Normal

Write-Host "✅ Déploiement terminé !" -ForegroundColor Green
Write-Host "🔗 URLs de démonstration :" -ForegroundColor White
Write-Host "   Frontend: https://assurance-frontend-demo.loca.lt" -ForegroundColor Yellow
Write-Host "   Backend API: https://assurance-backend-demo.loca.lt" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Partagez ces URLs avec votre acheteur" -ForegroundColor Cyan