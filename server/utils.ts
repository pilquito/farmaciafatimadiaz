import path from "path";
import fs from "fs";
import { type Express } from "express";
import express from "express";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export function serveStatic(app: Express) {
  // Intentamos varias rutas comunes en entornos Docker/Build
  const possiblePaths = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "public"),
    path.resolve(import.meta.dirname, "public"),
    path.resolve(import.meta.dirname, "..", "public"),
  ];

  let distPath = "";
  for (const p of possiblePaths) {
    if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
      distPath = p;
      break;
    }
  }

  if (!distPath) {
    console.error("ERROR: No se encontró el directorio de build del frontend (index.html no encontrado).");
    console.log("Rutas buscadas:", possiblePaths);
    
    // Si no lo encontramos, al menos servimos algo para que el contenedor no explote, 
    // pero lanzamos error para que aparezca en los logs.
    throw new Error(
      `No se pudo encontrar el directorio de build del cliente. Por favor, verifica que 'npm run build' se haya ejecutado correctamente.`
    );
  }

  log(`Sirviendo archivos estáticos desde: ${distPath}`, "info");
  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
