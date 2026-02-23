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
        console.error("--- ERROR CRÍTICO: NO SE ENCONTRÓ EL FRONTEND ---");
        console.error("No se encontró el directorio de build (buscando index.html).");
        console.log("Rutas comprobadas:");
        possiblePaths.forEach(p => console.log(` - ${p} -> ${fs.existsSync(p) ? 'Existe' : 'No existe'}`));

        // Listar contenido de directorios clave para diagnóstico
        try {
            console.log("Contenido de /app/dist:");
            if (fs.existsSync("/app/dist")) console.log(fs.readdirSync("/app/dist"));
            else console.log("/app/dist no existe");

            console.log("Contenido del directorio actual (cwd):", process.cwd());
            console.log(fs.readdirSync(process.cwd()));
        } catch (e) { }

        throw new Error(
            `No se pudo encontrar el directorio de build del cliente. Por favor, verifica los logs de arriba para ver las rutas comprobadas.`
        );
    }

    log(`Sirviendo archivos estáticos desde: ${distPath}`, "info");
    app.use(express.static(distPath));

    app.use("*", (_req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}
