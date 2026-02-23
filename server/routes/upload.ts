import { Router } from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import type { Request, Response, NextFunction } from "express";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configurar multer para manejar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log(`[UPLOAD] File received: ${file.originalname}, type: ${file.mimetype}`);
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Middleware para verificar autenticación de admin
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).session?.user || (req as any).session.user.role !== "admin") {
    return res.status(401).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
  }
  next();
};

// Endpoint para subir imágenes de personal
router.post("/staff-image", upload.single('image'), async (req, res) => {
  try {
    console.log(`[UPLOAD] Processing upload - Files:`, req.file ? 'File received' : 'No file');
    console.log(`[UPLOAD] Body:`, req.body);
    
    if (!req.file) {
      console.log(`[UPLOAD] Error: No file received`);
      return res.status(400).json({ message: "No se recibió ningún archivo" });
    }

    // Crear directorio si no existe
    const uploadsDir = path.join(__dirname, '../../uploads/staff');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const extension = path.extname(req.file.originalname);
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const finalFilename = `${timestamp}_${safeName}`;
    const filePath = path.join(uploadsDir, finalFilename);

    console.log(`[UPLOAD] Saving file to: ${filePath}`);
    
    // Guardar archivo
    await fs.writeFile(filePath, req.file.buffer);

    // Devolver la URL de la imagen
    const imageUrl = `/uploads/staff/${finalFilename}`;
    console.log(`[UPLOAD] Success: ${imageUrl}`);
    
    res.json({ 
      url: imageUrl,
      message: "Imagen subida exitosamente" 
    });

  } catch (error) {
    console.error("[UPLOAD] Error uploading staff image:", error);
    res.status(500).json({ 
      message: "Error interno del servidor", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;