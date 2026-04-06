# Script d'installation automatique des bases de données
# Nécessite Chocolatey (https://chocolatey.org/)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Installation MySQL et PostgreSQL" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Vérifier si Chocolatey est installé
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "Installation de Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    refreshenv
}

# Installation MySQL
Write-Host "Installation de MySQL..." -ForegroundColor Green
choco install mysql -y --params="/port:3306 /serviceName:MySQL"

# Installation PostgreSQL
Write-Host "Installation de PostgreSQL..." -ForegroundColor Green
choco install postgresql -y --params="/password:admin123 /port:5432"

# Attendre que les services démarrent
Write-Host "Démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
Start-Service MySQL* -ErrorAction SilentlyContinue
Start-Service postgresql* -ErrorAction SilentlyContinue

# Configuration MySQL
Write-Host "Configuration MySQL..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
try {
    mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'admin123';" -ErrorAction SilentlyContinue
    mysql -u root -padmin123 -e "CREATE DATABASE IF NOT EXISTS assurance_sante_db;" -ErrorAction SilentlyContinue
    Write-Host "MySQL configuré avec succès!" -ForegroundColor Green
} catch {
    Write-Host "Configuration MySQL manuelle requise" -ForegroundColor Red
}

# Configuration PostgreSQL
Write-Host "Configuration PostgreSQL..." -ForegroundColor Yellow
try {
    $pgPath = Get-ChildItem "C:\Program Files\PostgreSQL\*\bin\createdb.exe" | Select-Object -First 1
    if ($pgPath) {
        & $pgPath.FullName -U postgres assurance_sante_db
        Write-Host "PostgreSQL configuré avec succès!" -ForegroundColor Green
    }
} catch {
    Write-Host "Configuration PostgreSQL manuelle requise" -ForegroundColor Red
}

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Installation terminee!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "MySQL: localhost:3306, user: root, password: admin123"
Write-Host "PostgreSQL: localhost:5432, user: postgres, password: admin123"
Write-Host ""
Write-Host "Pour demarrer l'application avec MySQL:" -ForegroundColor Cyan
Write-Host "cd backend; mvn spring-boot:run -Dspring-boot.run.profiles=mysql"
Write-Host ""
Write-Host "Pour demarrer l'application avec PostgreSQL:" -ForegroundColor Cyan
Write-Host "cd backend; mvn spring-boot:run -Dspring-boot.run.profiles=postgres"
Write-Host ""