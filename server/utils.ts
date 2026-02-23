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
        // Rutas absolutas directas como último recurso
        "/app/dist/public",
        "/dist/public"
    ];

    let distPath = "";
    for (const p of possiblePaths) {
        if (fs.existsSync(p) && fs.existsSync(path.join(p, "index.html"))) {
            distPath = p;
            break;
        }
    }

    if (!distPath) {
        console.error("--- ERROR CRÍTICO: FRONTEND NO ENCONTRADO ---");
        console.error("No se encontró el directorio de build (buscando index.html).");
        console.log("Rutas comprobadas:");
        possiblePaths.forEach(p => console.log(` - ${p} -> ${fs.existsSync(p) ? 'FALTA index.html' : 'NO EXISTE CARPETA'}`));
        
        // Diagnóstico profundo del disco
        try {
            console.log("Mapeo de directorios para depuración:");
            const dirsToScan = ["/app", "/app/dist", "/app/client"];
            dirsToScan.forEach(d => {
                if (fs.existsSync(d)) {
                    console.log(`Contenido de ${d}:`, fs.readdirSync(d));
                } else {
                    console.log(`${d} no existe.`);
                }
            });
        } catch (e) { console.error("Error en diagnóstico:", e); }

        throw new Error(
            `Fallo al localizar el frontend. Revisa los logs de arriba para ver el mapeo de directorios.`
        );
    }

    log(`Sirviendo archivos estáticos desde: ${distPath}`, "info");
    app.use(express.static(distPath));

    app.use("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}
