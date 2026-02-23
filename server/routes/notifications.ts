import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { insertNotificationSchema } from "@shared/schema";

const notificationsRouter = Router();

// Middleware para verificar autenticación
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "No autenticado" });
  }
  next();
};

// Obtener todas las notificaciones del usuario actual
notificationsRouter.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId as number;
    
    // Simulación: Por ahora devolvemos notificaciones de ejemplo
    // Esto debe ser reemplazado por la implementación real cuando se implemente la BD
    const sampleNotifications = [
      {
        id: 1,
        userId: userId,
        title: "Puntos de fidelización añadidos",
        message: "Has recibido 50 puntos por tu compra reciente de medicamentos.",
        type: "success",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // Ayer
      },
      {
        id: 2,
        userId: userId,
        title: "Recordatorio de cita",
        message: "Tu cita con el Dr. Martínez está programada para mañana a las 10:00.",
        type: "info",
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // Hace 2 días
      },
      {
        id: 3,
        userId: userId,
        title: "Oferta especial",
        message: "¡Aprovecha nuestro 20% de descuento en productos de cuidado personal!",
        type: "info",
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString() // Hace 3 días
      }
    ];
    
    return res.json(sampleNotifications);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// Marcar una notificación como leída
notificationsRouter.patch("/:id/read", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.session.userId as number;
    
    // Simulación: Confirmar que la operación fue exitosa
    // En la implementación real, actualizar la base de datos
    
    return res.json({ 
      success: true, 
      message: "Notificación marcada como leída" 
    });
  } catch (error) {
    console.error("Error al marcar notificación como leída:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// Actualizar preferencias de notificaciones por email
notificationsRouter.post("/email-preferences", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { emailNotifications } = req.body;
    const userId = req.session.userId as number;
    
    if (typeof emailNotifications !== 'boolean') {
      return res.status(400).json({ 
        message: "El parámetro emailNotifications debe ser un booleano" 
      });
    }
    
    // Simulación: Actualizar preferencias de notificaciones
    // En la implementación real, actualizar la base de datos
    
    return res.json({ 
      success: true, 
      message: `Notificaciones por email ${emailNotifications ? 'activadas' : 'desactivadas'}`
    });
  } catch (error) {
    console.error("Error al actualizar preferencias de notificaciones:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

export default notificationsRouter;