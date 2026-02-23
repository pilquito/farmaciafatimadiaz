// Removed static import to avoid production runtime dependency
// import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Usamos una función async para evitar que esbuild detecte la dependencia estática
async function getPlugins() {
  if (process.env.NODE_ENV === "production" && !process.env.VITE_BUILD) {
    return [];
  }
  const pluginName = "@vitejs" + "/plugin-react";
  const react = (await import(pluginName)).default;
  return [react()];
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
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
};
