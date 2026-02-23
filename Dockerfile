# --- Etapa de construcción ---
FROM node:20 AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno para la construcción
ENV CI=true
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NODE_ENV=production

# PASO 1: Construir el frontend (Vite)
# Usamos tee para asegurar que la salida se vea en el terminal aunque falle
RUN npx vite build --root client --config vite.config.ts 2>&1 | tee /tmp/vite.log || (echo "VITE BUILD FAILED. LOGS:" && cat /tmp/vite.log && exit 1)

# PASO 2: Construir el backend (esbuild)
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist 2>&1 | tee /tmp/esbuild.log || (echo "ESBUILD BUILD FAILED. LOGS:" && cat /tmp/esbuild.log && exit 1)

# --- Etapa de ejecución ---
# Usamos la imagen normal para mayor compatibilidad
FROM node:20

WORKDIR /app

# Establecer entorno de producción
ENV NODE_ENV=production

# Copiar solo lo necesario desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Crear carpeta de uploads
RUN mkdir -p uploads

# Exponer el puerto
EXPOSE 5000

# Comando para arrancar la aplicación
CMD ["npm", "start"]
