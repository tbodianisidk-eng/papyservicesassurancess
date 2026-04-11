# ============================================================
# setup-postgres.ps1 — A executer en PowerShell ADMINISTRATEUR
# ============================================================
Write-Host "=== Installation PostgreSQL 17 ===" -ForegroundColor Cyan

$installer = "$env:TEMP\postgresql-installer.exe"

# 1. Télécharger l'installateur PostgreSQL 17
Write-Host "[1] Téléchargement de PostgreSQL 17..." -ForegroundColor Yellow
$url = "https://get.enterprisedb.com/postgresql/postgresql-17.2-1-windows-x64.exe"
Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
Write-Host "    Téléchargement terminé."

# 2. Lancer l'installation silencieuse
Write-Host "[2] Installation en cours (patientez ~2 minutes)..." -ForegroundColor Yellow
& $installer `
    --mode unattended `
    --superpassword "admin123" `
    --servicename "postgresql-x64-17" `
    --servicepassword "admin123" `
    --serverport 5432 `
    --datadir "C:\Program Files\PostgreSQL\17\data" | Out-Null

Write-Host "[3] Démarrage du service..." -ForegroundColor Yellow
Start-Service "postgresql-x64-17" -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# 3. Créer la base de données
Write-Host "[4] Création de la base assurance_sante_db..." -ForegroundColor Yellow
$env:PGPASSWORD = "admin123"
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE assurance_sante_db ENCODING 'UTF8';" 2>&1

Write-Host ""
Write-Host "=== PostgreSQL prêt ===" -ForegroundColor Green
Write-Host "  Host     : localhost"
Write-Host "  Port     : 5432"
Write-Host "  User     : postgres"
Write-Host "  Password : admin123"
Write-Host "  Database : assurance_sante_db"
