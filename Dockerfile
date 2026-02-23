# --- Etapa de construcción ---
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias necesarias para compilación si hicieran falta
# RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./

# Forzar limpieza y instalar (por si el lockfile tiene conflictos de plataforma)
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno para la construcción
ENV CI=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Construir el frontend y backend
# Usamos el script de build directamente. Si falla, el --verbose de npm debería ayudar.
RUN npm run build --verbose

# --- Etapa de ejecución ---
FROM node:20-slim

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
