# VD Audio Rental Backend

Backend API para el sistema de contacto de VD Audio Rental, configurado para funcionar tanto en desarrollo local como en producción sin cambios.

## 🚀 Características

- **Configuración automática por entorno**: Detecta automáticamente si estás en desarrollo o producción
- **Sin cambios manuales**: Funciona localmente y en producción con la misma configuración
- **Validación automática**: Verifica que todas las variables necesarias estén configuradas
- **Scripts de despliegue**: Facilita la transición entre entornos
- **Seguridad robusta**: Helmet, CORS, rate limiting y validación de entrada

## 📁 Estructura de Archivos

```
backend/
├── config/
│   └── environment.js          # Configuración centralizada por entorno
├── .env                        # Variables de desarrollo (crear desde env.example)
├── .env.production            # Variables de producción (crear desde production-config.env)
├── env.example                # Plantilla para desarrollo
├── production-config.env      # Plantilla para producción
├── deploy.js                  # Script de despliegue interactivo
├── start.js                   # Script de inicio con validaciones
└── server.js                  # Servidor principal
```

## 🛠️ Configuración Inicial

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar entorno de desarrollo
```bash
# Copiar la plantilla de desarrollo
cp env.example .env

# Editar .env con tus credenciales
nano .env
```

### 3. Configurar entorno de producción
```bash
# Usar el script de despliegue
npm run deploy

# O crear manualmente
cp production-config.env .env.production
nano .env.production
```

## 🌍 Variables de Entorno

### Variables Requeridas
- `EMAIL_USER`: Tu email de Gmail
- `EMAIL_PASS`: Contraseña de aplicación de Gmail
- `JWT_SECRET`: Clave secreta para JWT

### Variables Opcionales
- `NODE_ENV`: Entorno (development/production)
- `PORT`: Puerto del servidor (default: 3000)
- `CORS_ORIGIN`: Orígenes permitidos para CORS
- `RATE_LIMIT_MAX_REQUESTS`: Límite de requests por IP
- `LOG_LEVEL`: Nivel de logging (debug/info/warn/error)

## 🚀 Comandos Disponibles

### Desarrollo
```bash
# Iniciar en modo desarrollo
npm run dev

# Iniciar en modo desarrollo (sin nodemon)
npm start
```

### Producción
```bash
# Iniciar en modo producción
npm run start:prod

# O establecer variable de entorno
NODE_ENV=production npm start
```

### Utilidades
```bash
# Script de despliegue interactivo
npm run deploy

# Validar configuración actual
npm run validate

# Iniciar servidor directamente
npm run server
```

## 🔧 Script de Despliegue

El script `deploy.js` te permite:

1. **Cambiar a modo PRODUCCIÓN**: Establece `NODE_ENV=production`
2. **Cambiar a modo DESARROLLO**: Establece `NODE_ENV=development`
3. **Crear archivo de producción**: Genera `.env.production` desde la plantilla
4. **Validar configuración**: Verifica que todo esté configurado correctamente

```bash
npm run deploy
```

## 🌐 Configuración Automática por Entorno

### Desarrollo (NODE_ENV=development o no definido)
- **CORS**: Permite localhost y puertos de desarrollo
- **Rate Limiting**: 1000 requests por 15 minutos
- **Logging**: Nivel debug, stack traces habilitados
- **Debug**: Logging detallado habilitado

### Producción (NODE_ENV=production)
- **CORS**: Solo dominios de producción (configurados en `.env.production`)
- **Rate Limiting**: 100 requests por 15 minutos
- **Logging**: Nivel info, stack traces deshabilitados
- **Debug**: Logging detallado deshabilitado

## 📧 Configuración de Email

### Gmail Setup
1. Habilitar autenticación de 2 factores
2. Generar contraseña de aplicación
3. Usar la contraseña de aplicación en `EMAIL_PASS`

### Variables de Email
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicacion
EMAIL_FROM=noreply@tudominio.com
EMAIL_TO=contact@vdaudiorentals.com
```

## 🔒 Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Orígenes permitidos configurados por entorno
- **Rate Limiting**: Protección contra spam y ataques
- **Input Validation**: Validación de entrada con express-validator
- **JWT**: Autenticación segura

## 📝 Logs

Los logs se guardan en:
- **Desarrollo**: `./logs/development.log`
- **Producción**: `./logs/production.log`

## 🚀 Despliegue

### 1. Preparar archivo de producción
```bash
npm run deploy
# Seleccionar opción 3 para crear .env.production
```

### 2. Editar variables de producción
```bash
nano .env.production
# Cambiar todos los valores placeholder
```

### 3. Iniciar en producción
```bash
npm run start:prod
```

### 4. Verificar funcionamiento
```bash
curl http://localhost:3000/api/health
```

## 🔍 Troubleshooting

### Error: "Missing required configuration"
- Verificar que `.env` o `.env.production` exista
- Comprobar que `EMAIL_USER`, `EMAIL_PASS`, y `JWT_SECRET` estén configurados

### Error: "CORS policy"
- Verificar que el origen de tu frontend esté en `CORS_ORIGIN`
- En desarrollo, los orígenes localhost están permitidos automáticamente

### Error: "Rate limit exceeded"
- En desarrollo: 1000 requests por 15 minutos
- En producción: 100 requests por 15 minutos
- Ajustar `RATE_LIMIT_MAX_REQUESTS` si es necesario

## 📚 API Endpoints

- `POST /api/contact` - Formulario de contacto
- `POST /api/inquiry` - Consultas de equipamiento
- `GET /api/health` - Estado del servidor

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](../LICENSE) para detalles.
