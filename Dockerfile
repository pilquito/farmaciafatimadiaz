# --- Etapa de construcción ---
FROM node:20 AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar TODAS las dependencias (incluyendo devDependencies para el build)
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Variables de entorno para la fase de construcción
ENV NODE_ENV=production
ENV VITE_BUILD=true
ENV CI=true

# Ejecutar el build unificado definido en package.json
# Esto corre: vite build && esbuild server/index.ts ...
RUN npm run build

# VERIFICACIÓN CRÍTICA:
# Listamos el contenido de dist para confirmar que el build generó lo esperado.
# Si dist/public no existe, este paso fallará el build de Docker inmediatamente.
RUN echo "Verificando estructura del directorio dist..." && \
    ls -lR dist && \
    if [ ! -d "dist/public" ]; then echo "ERROR: El directorio dist/public no existe tras el build." && exit 1; fi && \
    if [ ! -f "dist/index.js" ]; then echo "ERROR: El archivo dist/index.js no existe tras el build." && exit 1; fi

# --- Etapa de ejecución (Runtime) ---
FROM node:20-slim

WORKDIR /app

# Copiar archivos de dependencias para instalar el mínimo necesario
COPY package*.json ./

# Instalar solo dependencias de producción para mantener la imagen ligera
RUN npm install --omit=dev

# Copiar TODO el contenido de dist generado en la etapa anterior
COPY --from=builder /app/dist ./dist

# Crear carpetas necesarias para la aplicación
RUN mkdir -p uploads storage

# Configuración de entorno para ejecución
ENV NODE_ENV=production
ENV PORT=5000

# Exponer el puerto de la aplicación
EXPOSE 5000

# Comando para iniciar la aplicación usando el bundle generado
CMD ["npm", "start"]
