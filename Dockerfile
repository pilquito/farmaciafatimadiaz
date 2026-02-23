# Usamos una sola etapa para evitar problemas de copiado entre etapas en entornos limitados
FROM node:20

WORKDIR /app

# Instalar dependencias primero para aprovechar el caché de capas
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Variables de entorno para el build
ENV NODE_ENV=production
ENV VITE_BUILD=true
ENV CI=true

# Ejecutar el build unificado
RUN npm run build

# VERIFICACIÓN POST-BUILD:
# Esto detendrá el proceso de creación de la imagen si los archivos no están donde deben.
RUN echo "--- CONTENIDO DEL DIRECTORIO DIST TRAS EL BUILD ---" && \
    ls -lR dist && \
    if [ ! -d "dist/public" ]; then echo "ERROR: El directorio dist/public no existe tras el build." && exit 1; fi && \
    if [ ! -f "dist/index.js" ]; then echo "ERROR: El archivo dist/index.js no existe tras el build." && exit 1; fi

# Limpiar dependencias de desarrollo para ahorrar espacio
# (Hacemos esto después del build para no borrar herramientas necesarias para compilar)
RUN npm prune --omit=dev

# Crear carpetas necesarias
RUN mkdir -p uploads storage

# Configuración final
ENV PORT=5000
EXPOSE 5000

# Comando de arranque con depuración de rutas
CMD echo "--- REVISIÓN DE RUTAS AL ARRANCAR ---" && \
    pwd && \
    ls -lR dist && \
    npm start
