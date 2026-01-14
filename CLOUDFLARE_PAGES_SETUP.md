# 🌐 Configuration Cloudflare Pages

## ⚠️ Configuration requise dans l'interface Cloudflare Pages

Pour que le déploiement fonctionne correctement, vous devez configurer les paramètres suivants dans l'interface Cloudflare Pages :

### 📋 Paramètres de Build

1. **Root directory (Répertoire racine)** : 
   - Laissez **VIDE** ou mettez `.` (point)
   - ❌ **NE PAS** mettre `client` ici

2. **Build command (Commande de build)** :
   ```
   npm run build
   ```
   - Cette commande utilise le script `build` du `package.json` racine
   - Le script fait automatiquement `cd client && npm install && npm run build`

3. **Build output directory (Répertoire de sortie)** :
   ```
   client/dist
   ```
   - C'est là que Vite génère les fichiers statiques

4. **Node.js version** :
   - Utilisez Node.js 18 ou supérieur

### 🔧 Configuration dans l'interface Cloudflare Pages

1. Allez dans votre projet Cloudflare Pages
2. Cliquez sur **Settings** (Paramètres)
3. Allez dans la section **Builds & deployments**
4. Configurez :
   - **Root directory** : (vide ou `.`)
   - **Build command** : `npm run build`
   - **Build output directory** : `client/dist`
   - **Node version** : `18` ou supérieur

### ✅ Vérification

Après configuration, le build devrait :
1. Installer les dépendances à la racine
2. Exécuter `npm run build` qui :
   - Change dans le répertoire `client`
   - Installe les dépendances du client
   - Exécute `vite build`
3. Générer les fichiers dans `client/dist`

### 🐛 Problèmes courants

**Erreur : "Cannot find cwd: /opt/buildhome/repo/client"**
- ✅ Solution : Mettez le **Root directory** à vide (ou `.`) au lieu de `client`
- Le script de build gère automatiquement le changement de répertoire

**Erreur : "Cannot find module"**
- ✅ Solution : Vérifiez que `postinstall` s'exécute correctement
- Le script `postinstall` installe automatiquement les dépendances du client

**Build réussi mais site ne fonctionne pas**
- ✅ Solution : Vérifiez que **Build output directory** est bien `client/dist`
