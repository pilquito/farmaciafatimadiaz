import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL && process.env.NODE_ENV === "production") {
  console.warn("DATABASE_URL no está configurada. La conexión fallará en tiempo de ejecución.");
}

console.log("Iniciando conexión a la base de datos...");

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Función de ayuda para inicializar la base de datos
export async function initializeDatabase() {
  try {
    console.log("Comprobando si la base de datos está disponible...");
    
    // Realizar una consulta simple para verificar la conexión
    const result = await pool.query('SELECT NOW()');
    
    if (result.rows.length > 0) {
      console.log("Conexión a la base de datos establecida correctamente:", result.rows[0].now);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    return false;
  }
}
