# --- Etapa de construcción ---
FROM node:20 AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno para la construcción (para evitar que fallen scripts que busquen el DB)
ENV NODE_ENV=production
ENV CI=true

# PASO 1: Construir el frontend (Vite)
# Capturamos la salida para ver exactamente qué falla
RUN npx vite build --root client --config vite.config.ts 2>&1 | tee /tmp/vite.log || (echo "VITE BUILD FAILED. LOGS:" && cat /tmp/vite.log && exit 1)

# PASO 2: Construir el backend (esbuild)
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist 2>&1 | tee /tmp/esbuild.log || (echo "ESBUILD BUILD FAILED. LOGS:" && cat /tmp/esbuild.log && exit 1)

# --- Etapa de ejecución ---
FROM node:20-slim

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar la aplicación compilada
COPY --from=builder /app/dist ./dist

# Crear carpeta de uploads
RUN mkdir -p uploads

# Variables de entorno runtime
ENV NODE_ENV=production
ENV PORT=5000

# Exponer el puerto
EXPOSE 5000

# Comando para arrancar la aplicación
CMD ["npm", "start"]
