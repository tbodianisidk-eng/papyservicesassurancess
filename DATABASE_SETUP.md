# Configuration des Bases de Données

Ce guide explique comment configurer et utiliser MySQL ou PostgreSQL avec votre application Assurance Santé Connect.

## 🚀 Démarrage Rapide

### Avec MySQL (Recommandé)
```bash
# 1. Installer MySQL
.\setup-database.ps1

# 2. Démarrer l'application
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

### Avec PostgreSQL
```bash
# 1. Installer PostgreSQL
.\setup-database.ps1

# 2. Démarrer l'application
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

## 📋 Configuration Détaillée

### MySQL

#### Installation
1. **Via Chocolatey (Recommandé)** :
   ```powershell
   choco install mysql
   ```

2. **Via Installer officiel** :
   - Téléchargez depuis [mysql.com](https://dev.mysql.com/downloads/installer/)
   - Suivez l'assistant d'installation

#### Configuration
Après installation, connectez-vous à MySQL :
```sql
CREATE DATABASE assurance_sante_db;
CREATE USER 'root'@'localhost' IDENTIFIED BY 'admin123';
GRANT ALL PRIVILEGES ON assurance_sante_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

#### Démarrage
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

### PostgreSQL

#### Installation
1. **Via Chocolatey (Recommandé)** :
   ```powershell
   choco install postgresql
   ```

2. **Via Installer officiel** :
   - Téléchargez depuis [postgresql.org](https://www.postgresql.org/download/windows/)
   - Mot de passe superutilisateur : `admin123`

#### Configuration
Après installation, connectez-vous à PostgreSQL :
```sql
CREATE DATABASE assurance_sante_db;
```

#### Démarrage
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

## 🔧 Profils Spring Boot

### Changer de profil
Modifiez dans `application.yml` :
```yaml
spring:
  profiles:
    active: mysql    # ou 'postgres' ou 'h2'
```

### Profils disponibles
- `mysql` : MySQL 8.0+
- `postgres` : PostgreSQL 12+
- `h2` : H2 Database (défaut, en mémoire)

## 📊 Comparaison des Bases de Données

| Fonctionnalité | H2 | MySQL | PostgreSQL |
|---|---|---|---|
| Persistance | ❌ Mémoire | ✅ Disque | ✅ Disque |
| Production | ❌ Non | ✅ Oui | ✅ Oui |
| Performance | ⚡ Excellente | ✅ Bonne | ✅ Excellente |
| Installation | ✅ Simple | ⚠️ Moyenne | ⚠️ Moyenne |
| Migration | ❌ Nécessaire | ✅ Recommandé | ✅ Recommandé |

## 🐛 Dépannage

### Erreur de connexion MySQL
```bash
# Vérifier si MySQL fonctionne
netstat -ano | findstr :3306

# Redémarrer le service MySQL
net stop mysql
net start mysql
```

### Erreur de connexion PostgreSQL
```bash
# Vérifier si PostgreSQL fonctionne
netstat -ano | findstr :5432

# Redémarrer le service PostgreSQL
net stop postgresql
net start postgresql
```

### Problème de driver
Assurez-vous que les dépendances sont installées :
```bash
mvn clean install
```

## 🔒 Sécurité

### MySQL
- Changez le mot de passe par défaut `admin123`
- Utilisez des utilisateurs dédiés pour l'application
- Activez SSL en production

### PostgreSQL
- Changez le mot de passe superutilisateur
- Créez un utilisateur dédié pour l'application
- Configurez pg_hba.conf pour la sécurité

## 📈 Migration depuis H2

Si vous migrez depuis H2 :
1. Exportez vos données depuis la console H2 (`http://localhost:3001/api/h2-console`)
2. Importez dans MySQL/PostgreSQL
3. Changez le profil dans `application.yml`
4. Redémarrez l'application

---

**Besoin d'aide ?** Consultez les logs de l'application pour les erreurs de base de données.