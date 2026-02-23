# --- Etapa de construcción ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo dev)
RUN npm install

# Copiar el resto del código
COPY . .

# Listar archivos para verificar que todo se copió bien
RUN ls -R | grep ":$" | sed -e 's/:$//' -e 's/[^-][^\/]*\//--/g' -e 's/^/   /' -e 's/-/|/'

# Construir el frontend y backend con máxima verbosidad
RUN npm run build --verbose

# --- Etapa de ejecución ---
FROM node:20-alpine

WORKDIR /app

# Establecer entorno de producción
ENV NODE_ENV=production

# Copiar solo lo necesario desde la etapa de construcción
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Crear carpeta de uploads por si acaso (aunque se recomienda usar volúmenes)
RUN mkdir -p uploads

# Exponer el puerto
EXPOSE 5000

# Comando para arrancar la aplicación
CMD ["npm", "start"]
