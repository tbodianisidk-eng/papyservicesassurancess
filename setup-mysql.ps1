# ============================================================
# setup-mysql.ps1 — A executer en PowerShell ADMINISTRATEUR
# ============================================================
$mysql  = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
$client = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$dataDir = "C:\ProgramData\MySQL\MySQL Server 8.0\Data"

Write-Host "=== Setup MySQL Server 8.0 ===" -ForegroundColor Cyan

# 1. Arrêter l'éventuel processus mysqld en cours
Write-Host "[1] Arrêt de tout processus mysqld existant..."
Get-Process -Name "mysqld" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Supprimer l'ancien dossier Data si corrompu
if (Test-Path $dataDir) {
    Write-Host "[2] Suppression de l'ancien dossier Data..."
    Remove-Item $dataDir -Recurse -Force
}

# 3. Initialiser MySQL (sans mot de passe root = vide)
Write-Host "[3] Initialisation de MySQL..."
& $mysql --initialize-insecure --console 2>&1
Start-Sleep -Seconds 5

# 4. Installer le service Windows
Write-Host "[4] Installation du service MySQL80..."
& $mysql --install MySQL80 2>&1

# 5. Démarrer le service
Write-Host "[5] Démarrage du service MySQL80..."
Start-Service MySQL80
Start-Sleep -Seconds 5

# 6. Définir le mot de passe root = admin123
Write-Host "[6] Définition du mot de passe root = admin123..."
& $client -u root --connect-expired-password -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'admin123'; FLUSH PRIVILEGES;" 2>&1

# 7. Créer la base de données
Write-Host "[7] Création de la base assurance_sante_db..."
& $client -u root -padmin123 -e "CREATE DATABASE IF NOT EXISTS assurance_sante_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1

Write-Host ""
Write-Host "=== MySQL prêt ===" -ForegroundColor Green
Write-Host "  Host     : localhost"
Write-Host "  Port     : 3306"
Write-Host "  User     : root"
Write-Host "  Password : admin123"
Write-Host "  Database : assurance_sante_db"
Write-Host ""
Write-Host "Testez avec : mysql -u root -padmin123 assurance_sante_db"
