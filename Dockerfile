# --- Etapa de construcción ---
FROM node:20 AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno para la construcción
ENV CI=true
ENV NODE_ENV=production

# Construir la aplicación
RUN npm run build

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
