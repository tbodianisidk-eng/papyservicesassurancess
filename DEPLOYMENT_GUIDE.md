# 🚀 Guide de Déploiement - Assurance Santé Connect

## 📋 Prérequis
- ✅ Backend JAR créé : `backend/target/assurance-sante-connect-1.0.0.jar`
- ✅ Frontend build : `dist/` folder prêt
- ✅ Base de données H2 (en mémoire pour démo)

## 🌐 Options de Déploiement

### 1. 🚄 Railway (Recommandé - Rapide & Gratuit)
**Plateforme**: https://railway.app

#### Backend (Spring Boot)
```bash
# 1. Créer un nouveau projet
# 2. Connecter le repo GitHub
# 3. Variables d'environnement :
PORT=8080
JAVA_OPTS=-Xmx512m -Xms256m
SPRING_PROFILES_ACTIVE=prod

# 4. Build Command :
./mvnw clean package -DskipTests

# 5. Start Command :
java -jar target/assurance-sante-connect-1.0.0.jar
```

#### Frontend (React)
```bash
# 1. Nouveau projet séparé
# 2. Build Command : npm run build
# 3. Publish Directory : dist
# 4. Variables d'environnement :
VITE_API_BASE_URL=https://[nom-backend].up.railway.app/api
```

### 2. 🎨 Vercel (Frontend uniquement)
**Plateforme**: https://vercel.com

```bash
# Installation Vercel CLI
npm i -g vercel

# Déploiement
vercel --prod

# Configuration :
# - Build Command: npm run build
# - Output Directory: dist
# - Environment Variables:
#   VITE_API_BASE_URL=https://[url-backend]
```

### 3. ⚡ Render (Backend + Frontend)
**Plateforme**: https://render.com

#### Backend Service
```yaml
# render.yaml
services:
  - type: web
    name: assurance-backend
    runtime: java
    buildCommand: mvn clean package -DskipTests
    startCommand: java -jar target/assurance-sante-connect-1.0.0.jar
    envVars:
      - key: PORT
        value: 8080
```

#### Frontend Service
```yaml
  - type: web
    name: assurance-frontend
    runtime: static
    buildCommand: npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_API_BASE_URL
        value: https://assurance-backend.onrender.com/api
```

## 🔧 Configuration Production

### Variables d'environnement requises :
```env
# Backend
PORT=8080
SPRING_PROFILES_ACTIVE=prod
SPRING_DATASOURCE_URL=jdbc:h2:mem:testdb
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver
SPRING_JPA_HIBERNATE_DDL_AUTO=create-drop

# Frontend
VITE_API_BASE_URL=https://votre-backend-url/api
```

## 📱 URLs de démonstration actuelles :
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001/api

## 🎯 Recommandation :
1. **Railway** pour une démo rapide (5-10 min)
2. **Vercel + Railway** pour séparation frontend/backend
3. **Render** pour configuration IaC

Besoin d'aide pour un déploiement spécifique ?