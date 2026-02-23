# Usamos una sola etapa para máxima fiabilidad
FROM node:20

WORKDIR /app

# 1. Instalar dependencias
COPY package*.json ./
RUN npm install

# 2. Copiar código fuente
COPY . .

# 3. Variables para el build
ENV NODE_ENV=production
ENV VITE_BUILD=true
ENV CI=true

# 4. Build del Frontend (Vite)
# Forzamos la salida a /app/dist/public explícitamente
RUN npx vite build --root client --config vite.config.ts --outDir ../dist/public

# 5. Build del Backend (esbuild)
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outfile=dist/index.js

# 6. VERIFICACIÓN CRÍTICA EN TIEMPO DE CONSTRUCCIÓN
# Si este paso falla, la imagen NO se crea.
RUN echo "--- VERIFICACIÓN FINAL DEL BUILD ---" && \
    ls -la /app/dist && \
    ls -la /app/dist/public && \
    if [ ! -f "/app/dist/public/index.html" ]; then echo "ERROR: index.html no encontrado en /app/dist/public"; exit 1; fi && \
    if [ ! -f "/app/dist/index.js" ]; then echo "ERROR: index.js no encontrado en /app/dist"; exit 1; fi

# 7. Limpieza selectiva (opcional, la quitamos para evitar problemas)
# RUN npm prune --omit=dev

# 8. Preparar carpetas de datos
RUN mkdir -p uploads storage

# Configuración de ejecución
ENV PORT=5000
EXPOSE 5000

# Comando de arranque con diagnóstico en vivo
CMD echo "--- DIAGNÓSTICO DE ARRANQUE ---" && \
    echo "Directorio actual: $(pwd)" && \
    echo "Contenido de dist:" && ls -R dist && \
    node dist/index.js
