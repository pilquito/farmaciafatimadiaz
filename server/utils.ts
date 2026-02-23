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
  const distPath = path.resolve(process.cwd(), "dist/public");

  if (!fs.existsSync(distPath)) {
    console.warn(`Directorio de build no encontrado en: ${distPath}`);
    const alternativePath = path.resolve(import.meta.dirname, "public");
    if (!fs.existsSync(alternativePath)) {
      throw new Error(
        `No se pudo encontrar el directorio de build. Busqué en: \n1. ${distPath}\n2. ${alternativePath}\nPor favor, asegúrate de compilar el cliente primero.`,
      );
    }
    app.use(express.static(alternativePath));
    app.use("*", (_req, res) => {
      res.sendFile(path.resolve(alternativePath, "index.html"));
    });
    return;
  }

  app.use(express.static(distPath));

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
