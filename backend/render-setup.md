# 🚀 VD Audio Rental Backend - Render Setup

## ✅ **Paso 0 Completado: Preparar el backend para Render**

### **1. Puerto dinámico configurado** ✅
```javascript
// En config/environment.js
port: process.env.PORT || 3000,

// En server.js
app.listen(PORT, () => { ... });
```

### **2. Scripts en package.json configurados** ✅
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "echo \"no build for backend\""
  },
  "engines": { "node": ">=18" }
}
```

### **3. Healthcheck simple agregado** ✅
```javascript
// Healthcheck para Render
app.get('/healthz', (req, res) => res.status(200).send('ok'));

// Healthcheck detallado existente
app.get('/api/health', (req, res) => { ... });
```

## 🌍 **Variables de Entorno para Render**

### **Variables Requeridas en Render:**
```env
NODE_ENV=production
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
JWT_SECRET=tu-clave-secreta-muy-segura
EMAIL_FROM=tu-email@gmail.com
EMAIL_TO=contact@vdaudiorentals.com
```

### **Variables Opcionales:**
```env
CORS_ORIGIN=https://tudominio.com,https://www.tudominio.com
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

## 🔧 **Configuración en Render Dashboard**

### **1. Build Command:**
```bash
npm install
```

### **2. Start Command:**
```bash
npm start
```

### **3. Environment Variables:**
- Ir a tu servicio en Render
- Sección "Environment"
- Agregar cada variable de entorno

## 📱 **Endpoints Disponibles**

### **Health Checks:**
- `GET /healthz` - Simple healthcheck para Render ✅
- `GET /api/health` - Healthcheck detallado ✅

### **APIs:**
- `POST /api/contact` - Formulario de contacto
- `POST /api/inquiry` - Consultas de equipamiento

### **Static Files:**
- `GET /` - Frontend SPA
- `GET /*` - Catch-all para SPA

## 🚀 **Despliegue en Render**

### **1. Conectar repositorio:**
- Conectar tu repo de GitHub
- Render detectará automáticamente que es Node.js

### **2. Configurar variables:**
- Copiar variables desde `.env.production`
- Asegurarse de que `NODE_ENV=production`

### **3. Desplegar:**
- Render construirá automáticamente
- El servicio estará disponible en la URL de Render

## 🔍 **Verificación Post-Despliegue**

### **1. Healthcheck:**
```bash
curl https://tu-app.onrender.com/healthz
# Debe responder: ok
```

### **2. API Health:**
```bash
curl https://tu-app.onrender.com/api/health
# Debe responder con JSON del estado del servidor
```

### **3. Frontend:**
- Visitar la URL de Render
- Verificar que el frontend cargue correctamente

## 🎯 **Ventajas de esta Configuración**

✅ **Puerto dinámico** - Funciona en cualquier puerto que Render asigne
✅ **Scripts optimizados** - `start` directo a `server.js` para Render
✅ **Healthchecks** - Render puede monitorear el estado del servicio
✅ **Variables de entorno** - Configuración segura y flexible
✅ **CORS automático** - Se adapta al entorno de producción
✅ **Rate limiting** - Protección contra spam en producción

## 📝 **Notas Importantes**

- **Nunca** subir `.env` o `.env.production` a Git
- **Siempre** usar `NODE_ENV=production` en Render
- **Verificar** que las variables de email estén configuradas
- **Monitorear** los logs en Render para debugging

¡Tu backend está listo para Render! 🎉
