import { Router, Request, Response } from "express";
import { storage } from "../storage";

const authRouter = Router();

// Registro de usuarios
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, username, password, firstName, lastName, phone, address, city, postalCode } = req.body;
    
    // Validación básica
    if (!email || !username || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email, usuario y contraseña son requeridos" 
      });
    }
    
    // Verificar si el usuario ya existe
    const existingUserByUsername = await storage.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ 
        success: false,
        message: "El nombre de usuario ya está en uso" 
      });
    }
    
    // Verificar si el email ya existe
    const existingUserByEmail = await storage.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ 
        success: false,
        message: "El email ya está registrado" 
      });
    }
    
    // Crear usuario
    await storage.createUser({
      email,
      username,
      password, // En una aplicación real, se debe hacer hash de la contraseña
      firstName: firstName || null,
      lastName: lastName || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      postalCode: postalCode || null,
      role: "customer", // Por defecto, todos los usuarios registrados son clientes
    });
    
    return res.status(201).json({ 
      success: true,
      message: "Usuario registrado correctamente"
    });
  } catch (error) {
    console.error("Error de registro:", error);
    return res.status(500).json({ 
      success: false,
      message: "Error del servidor" 
    });
  }
});

// Cerrar sesión
authRouter.post("/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar sesión:", err);
      return res.status(500).json({ message: "Error al cerrar sesión" });
    }
    
    res.clearCookie("connect.sid");
    return res.json({ success: true, message: "Sesión cerrada correctamente" });
  });
});

// Obtener perfil del usuario actual
authRouter.get("/profile", async (req: Request, res: Response) => {
  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "No autenticado" });
  }
  
  try {
    // Para el admin, devolver datos predefinidos
    if (req.session.userRole === "admin") {
      return res.json({
        id: 1,
        username: "admin",
        email: "admin@farmaciafatimadiaz.com",
        firstName: "Administrador",
        lastName: null,
        role: "admin",
        loyaltyPoints: 0,
        emailNotifications: true,
        profileImageUrl: null
      });
    }
    
    // Para clientes, obtener de la base de datos
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Excluir la contraseña de la respuesta
    const { password, ...userData } = user;
    return res.json(userData);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// Actualizar perfil del usuario
authRouter.patch("/profile", async (req: Request, res: Response) => {
  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "No autenticado" });
  }
  
  try {
    const { firstName, lastName, phone, address, city, postalCode } = req.body;
    
    // Para el admin, no permitir actualización
    if (req.session.userRole === "admin") {
      return res.status(403).json({ message: "No se puede actualizar el perfil de administrador" });
    }
    
    // Obtener usuario actual
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Actualizar usuario
    const updatedUser = await storage.updateUser(user.id, {
      firstName: firstName !== undefined ? firstName : user.firstName,
      lastName: lastName !== undefined ? lastName : user.lastName,
      phone: phone !== undefined ? phone : user.phone,
      address: address !== undefined ? address : user.address,
      city: city !== undefined ? city : user.city,
      postalCode: postalCode !== undefined ? postalCode : user.postalCode,
      updatedAt: new Date()
    });
    
    // Excluir la contraseña de la respuesta
    const { password, ...userData } = updatedUser || {};
    return res.json({
      success: true,
      message: "Perfil actualizado correctamente",
      user: userData
    });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

// Cambiar contraseña
authRouter.post("/change-password", async (req: Request, res: Response) => {
  // Verificar si el usuario está autenticado
  if (!req.session.userId) {
    return res.status(401).json({ message: "No autenticado" });
  }
  
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Contraseña actual y nueva son requeridas" });
    }
    
    // Para el admin, no permitir cambio de contraseña
    if (req.session.userRole === "admin") {
      return res.status(403).json({ message: "No se puede cambiar la contraseña del administrador" });
    }
    
    // Obtener usuario actual
    const user = await storage.getUser(req.session.userId);
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Verificar contraseña actual
    if (user.password !== currentPassword) {
      return res.status(400).json({ message: "Contraseña actual incorrecta" });
    }
    
    // Actualizar contraseña
    await storage.updatePassword(user.id, newPassword);
    
    return res.json({
      success: true,
      message: "Contraseña actualizada correctamente"
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({ message: "Error del servidor" });
  }
});

export default authRouter;