@echo off
echo ========================================
echo Installation et configuration MySQL
echo ========================================

echo.
echo Etape 1: Telechargement MySQL...
echo Veuillez telecharger MySQL depuis https://dev.mysql.com/downloads/installer/
echo Ou utiliser Chocolatey: choco install mysql

echo.
echo Etape 2: Installation...
echo Suivez l'assistant d'installation MySQL

echo.
echo Etape 3: Configuration...
echo Apres installation, executez MySQL Workbench ou mysql.exe

echo.
echo Commandes MySQL a executer:
echo CREATE DATABASE assurance_sante_db;
echo CREATE USER 'root'@'localhost' IDENTIFIED BY 'admin123';
echo GRANT ALL PRIVILEGES ON assurance_sante_db.* TO 'root'@'localhost';
echo FLUSH PRIVILEGES;

echo.
echo ========================================
echo Installation et configuration PostgreSQL
echo ========================================

echo.
echo Etape 1: Telechargement PostgreSQL...
echo Veuillez telecharger depuis https://www.postgresql.org/download/windows/
echo Ou utiliser Chocolatey: choco install postgresql

echo.
echo Etape 2: Installation...
echo - Mot de passe superutilisateur: admin123
echo - Port: 5432 (defaut)

echo.
echo Etape 3: Creation de la base de donnees...
echo Ouvrez pgAdmin ou psql et executez:
echo CREATE DATABASE assurance_sante_db;

echo.
pause