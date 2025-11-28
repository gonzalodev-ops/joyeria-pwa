# 🚀 Pasos Finales para Subir a GitHub

## ✅ Lo que YA está hecho:
- ✅ Git inicializado
- ✅ Todos los archivos agregados
- ✅ Commit inicial creado
- ✅ Rama renombrada a `main`
- ✅ `.gitignore` configurado (protege tus API keys)

---

## 📝 Solo te faltan 3 pasos:

### **Paso 1: Crear el repositorio en GitHub**

Ve a: https://github.com/new

Configura:
- **Repository name:** `joyeria-pwa`
- **Description:** `Progressive Web App para procesamiento de imágenes de joyería con IA`
- **Visibility:** Private (recomendado) o Public
- ⚠️ **NO marques** "Add a README file"
- ⚠️ **NO marques** "Add .gitignore"
- Click **"Create repository"**

---

### **Paso 2: Conectar tu repositorio local con GitHub**

Copia tu usuario de GitHub y ejecuta este comando (reemplaza `TU-USUARIO`):

```bash
git remote add origin https://github.com/TU-USUARIO/joyeria-pwa.git
```

Por ejemplo, si tu usuario es `gabrielleon`:
```bash
git remote add origin https://github.com/gabrielleon/joyeria-pwa.git
```

---

### **Paso 3: Subir el código**

```bash
git push -u origin main
```

GitHub te pedirá autenticación. Opciones:
- **Personal Access Token** (recomendado)
- **GitHub CLI** (`gh auth login`)
- **SSH Key**

---

## 🔐 Si necesitas crear un Personal Access Token:

1. Ve a: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Nombre: `Jewelry PWA Deploy`
4. Scopes: Marca **`repo`** (acceso completo a repositorios)
5. Click **"Generate token"**
6. **Copia el token** (solo se muestra una vez)
7. Cuando hagas `git push`, usa el token como contraseña

---

## 🎯 Después de subir a GitHub:

### Opción A: Desplegar en Vercel (Recomendado)
1. Ve a https://vercel.com
2. Click **"Add New Project"**
3. Importa `joyeria-pwa` desde GitHub
4. Configura las variables de entorno (ver abajo)
5. Click **"Deploy"**

### Opción B: Desplegar en Netlify
1. Ve a https://app.netlify.com
2. Click **"Add new site"** → **"Import from Git"**
3. Selecciona tu repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Agrega variables de entorno
7. Click **"Deploy"**

---

## 🔑 Variables de Entorno para Vercel/Netlify:

```
VITE_GEMINI_API_KEY=tu-api-key
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=tu-preset
VITE_SUPABASE_URL=tu-supabase-url
VITE_SUPABASE_ANON_KEY=tu-anon-key
VITE_PHOTOROOM_API_KEY=tu-photoroom-key
```

⚠️ **Cópialas de tu archivo `.env.local`**

---

## ❓ ¿Necesitas ayuda?

Dime en qué paso estás y te ayudo:
- Crear el Personal Access Token
- Configurar las variables en Vercel
- Resolver errores de autenticación
- Cualquier otra cosa

---

**Tu proyecto está listo para subir. Solo ejecuta los 3 pasos de arriba.** 🚀
