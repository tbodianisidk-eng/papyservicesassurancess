# Script de test des bases de données
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("mysql", "postgres", "h2")]
    [string]$Database
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Test de la base de données: $Database" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

switch ($Database) {
    "mysql" {
        Write-Host "Test de connectivité MySQL..." -ForegroundColor Yellow
        try {
            mysql -u root -padmin123 -e "SELECT 1 as test_mysql;" -ErrorAction Stop
            mysql -u root -padmin123 -e "CREATE DATABASE IF NOT EXISTS assurance_sante_db;" -ErrorAction Stop
            Write-Host "✅ MySQL fonctionne correctement!" -ForegroundColor Green
            Write-Host "Base de données 'assurance_sante_db' créée/prête" -ForegroundColor Green
            $dbReady = $true
        } catch {
            Write-Host "❌ Erreur MySQL: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Vérifiez que MySQL est installé et le service démarré" -ForegroundColor Red
            $dbReady = $false
        }
    }
    "postgres" {
        Write-Host "Test de connectivité PostgreSQL..." -ForegroundColor Yellow
        try {
            $env:PGPASSWORD = "admin123"
            psql -h localhost -U postgres -d postgres -c "SELECT 1 as test_postgres;" -ErrorAction Stop
            psql -h localhost -U postgres -c "CREATE DATABASE IF NOT EXISTS assurance_sante_db;" -ErrorAction Stop
            Write-Host "✅ PostgreSQL fonctionne correctement!" -ForegroundColor Green
            Write-Host "Base de données 'assurance_sante_db' créée/prête" -ForegroundColor Green
            $dbReady = $true
        } catch {
            Write-Host "❌ Erreur PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Vérifiez que PostgreSQL est installé et le service démarré" -ForegroundColor Red
            $dbReady = $false
        }
    }
    "h2" {
        Write-Host "Test H2 (base de données en mémoire)..." -ForegroundColor Yellow
        Write-Host "✅ H2 fonctionne toujours (pas d'installation requise)" -ForegroundColor Green
        Write-Host "⚠️ Note: Les données sont temporaires avec H2" -ForegroundColor Yellow
        $dbReady = $true
    }
}

if ($dbReady) {
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "Démarrage de l'application..." -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Cyan

    # Arrêter les processus Java existants
    Write-Host "Arrêt des processus Java existants..." -ForegroundColor Yellow
    taskkill /F /IM java.exe /T 2>$null

    # Démarrer l'application avec le profil spécifié
    Write-Host "Démarrage avec le profil $Database..." -ForegroundColor Green
    cd backend
    mvn spring-boot:run -Dspring-boot.run.profiles=$Database
} else {
    Write-Host ""
    Write-Host "❌ Base de données non prête. Veuillez installer et configurer $Database d'abord." -ForegroundColor Red
    Write-Host "Utilisez: .\setup-database.ps1" -ForegroundColor Yellow
}