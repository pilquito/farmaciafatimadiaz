import { Router, Request, Response } from "express";
import { storage } from "../storage";

const loyaltyRouter = Router();

// Middleware para verificar autenticación
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "No autenticado" });
  }
  next();
};

// Obtener el historial de puntos de fidelización del usuario actual
loyaltyRouter.get("/history", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId as number;
    
    // Simulación: Por ahora devolvemos historial de ejemplo
    // Esto debe ser reemplazado por la implementación real cuando se implemente la BD
    const sampleHistory = [
      {
        id: 1,
        userId: userId,
        points: 50,
        reason: "Compra de medicamentos",
        orderId: 123,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() // Hace 1 semana
      },
      {
        id: 2,
        userId: userId,
        points: 25,
        reason: "Registro en el programa de fidelización",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString() // Hace 2 semanas
      },
      {
        id: 3,
        userId: userId,
        points: -20,
        reason: "Canje por descuento de 1€",
        orderId: 145,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() // Hace 3 días
      },
      {
        id: 4,
        userId: userId,
        points: 10,
        reason: "Recomendación a un amigo",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // Ayer
      }
    ];
    
    return res.json(sampleHistory);
  } catch (error) {
    console.error("Error al obtener historial de puntos:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// Canjear puntos por recompensas
loyaltyRouter.post("/redeem", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { points, rewardId } = req.body;
    const userId = req.session.userId as number;
    
    if (!points || !rewardId) {
      return res.status(400).json({ message: "Puntos y recompensa son requeridos" });
    }
    
    // Simulación: Validar que el usuario tenga suficientes puntos
    // En la implementación real, validar contra la base de datos
    const userLoyaltyPoints = 100; // Simulado
    
    if (userLoyaltyPoints < points) {
      return res.status(400).json({ 
        message: "No tienes suficientes puntos para esta recompensa" 
      });
    }
    
    // Simulación: Actualizar puntos del usuario
    // En la implementación real, actualizar la base de datos
    
    return res.json({ 
      success: true, 
      message: `Has canjeado ${points} puntos correctamente`,
      newBalance: userLoyaltyPoints - points
    });
  } catch (error) {
    console.error("Error al canjear puntos:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// Obtener información resumida sobre los puntos del usuario
loyaltyRouter.get("/summary", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId as number;
    
    // Simulación: Datos de ejemplo
    const loyaltySummary = {
      totalPoints: 65,
      pointsEarned: 85,
      pointsRedeemed: 20,
      nextReward: {
        name: "Descuento de 5€",
        pointsNeeded: 100,
        pointsRemaining: 35
      }
    };
    
    return res.json(loyaltySummary);
  } catch (error) {
    console.error("Error al obtener resumen de puntos:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

export default loyaltyRouter;