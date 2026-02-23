// Removed static import to avoid production runtime dependency
// import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Usamos una función async para evitar que esbuild detecte la dependencia estática
async function getPlugins() {
  // Si estamos en ejecución (runtime) de producción, NO cargamos plugins de Vite
  if (process.env.NODE_ENV === "production" && !process.env.VITE_BUILD) {
    return [];
  }
  
  try {
    const pluginName = "@vitejs" + "/plugin-react";
    const react = (await import(pluginName)).default;
    return [react()];
  } catch (e) {
    console.warn("No se pudo cargar @vitejs/plugin-react, saltando...");
    return [];
  }
}

export default {
  plugins: await getPlugins(),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: "../dist/public", // Relative to root ('client') -> /app/dist/public
    emptyOutDir: true,
  },
};
