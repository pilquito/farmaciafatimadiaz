# --- Etapa de construcción ---
FROM node:20 AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev)
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno para la construcción
ENV CI=true
ENV NODE_ENV=production
ENV VITE_BUILD=true

# PASO 1: Frontend Build (Vite)
# Usamos --config explícito y verificamos el directorio dist/public
RUN npx vite build --root client --config vite.config.ts && \
    if [ ! -d "dist/public" ]; then echo "ERROR: dist/public no se creó" && exit 1; fi && \
    echo "Frontend build exitoso. Contenido de dist/public:" && \
    ls -la dist/public

# PASO 2: Backend Build (esbuild)
# Bundleamos el servidor y verificamos dist/index.js
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist && \
    if [ ! -f "dist/index.js" ]; then echo "ERROR: dist/index.js no se creó" && exit 1; fi && \
    echo "Backend build exitoso."

# --- Etapa de ejecución ---
FROM node:20-slim

WORKDIR /app

# Copiar archivos de dependencias para runtime
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar la aplicación compilada
# IMPORTANTE: Copiamos todo el directorio dist
COPY --from=builder /app/dist ./dist

# Crear carpetas necesarias
RUN mkdir -p uploads storage

# Variables de entorno runtime
ENV NODE_ENV=production
ENV PORT=5000

# Exponer el puerto
EXPOSE 5000

# Comando para arrancar la aplicación
CMD ["npm", "start"]
