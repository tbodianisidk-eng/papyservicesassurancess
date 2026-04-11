@echo off
chcp 65001 >nul
echo ============================================
echo   Papy Services Assurances - Démarrage
echo ============================================
echo.

echo [1/4] Démarrage de PostgreSQL via Docker...
docker compose up -d postgres
if %errorlevel% neq 0 (
    echo [ERREUR] Docker n'est pas démarré. Lancez Docker Desktop d'abord.
    pause
    exit /b 1
)
echo      Attente que PostgreSQL soit prêt...
timeout /t 8 /nobreak >nul
echo      PostgreSQL OK

echo.
echo [2/4] Démarrage du Backend Spring Boot (port 3001)...
start "Backend Spring Boot" cmd /k "cd /d c:\projet\assurance-sant-connect-main\backend && mvn spring-boot:run"

echo      Attente du démarrage backend (20s)...
timeout /t 20 /nobreak >nul

echo.
echo [3/4] Démarrage du Frontend React (port 5173)...
start "Frontend React" cmd /k "cd /d c:\projet\assurance-sant-connect-main && npm run dev"

echo.
echo ============================================
echo   Application démarrée !
echo   Frontend  : http://localhost:5173
echo   Backend   : http://localhost:3001
echo   PostgreSQL: localhost:5432
echo   DB        : assurance_sante_db
echo ============================================
echo.
pause
