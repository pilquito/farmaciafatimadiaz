import { Router, Request, Response } from 'express';
import { storage } from '../storage';

const adminRouter = Router();

// Middleware para verificar si el usuario es administrador
const isAdmin = async (req: Request, res: Response, next: Function) => {
  try {
    if (!req.session.user || !req.session.user.id) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    const user = await storage.getUser(parseInt(req.session.user.id));
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'No autorizado. Se requiere rol de administrador.' });
    }
    
    next();
  } catch (error) {
    console.error('Error al verificar rol de administrador:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Obtener todos los usuarios
adminRouter.get('/users', isAdmin, async (req: Request, res: Response) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Obtener un usuario por ID
adminRouter.get('/users/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  }
});

// Aprobar o desaprobar un usuario
adminRouter.patch('/users/:id/approve', isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { isApproved } = req.body;
    
    if (typeof isApproved !== 'boolean') {
      return res.status(400).json({ message: 'El parámetro isApproved debe ser un booleano' });
    }
    
    const user = await storage.updateUserApproval(userId, isApproved);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error al actualizar aprobación de usuario:', error);
    res.status(500).json({ message: 'Error al actualizar aprobación de usuario' });
  }
});

// Cambiar el rol de un usuario
adminRouter.patch('/users/:id/role', isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;
    
    if (typeof role !== 'string' || !['user', 'admin', 'doctor'].includes(role)) {
      return res.status(400).json({ message: 'El rol debe ser "user", "admin" o "doctor"' });
    }
    
    const user = await storage.updateUserRole(userId, role);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error al actualizar rol de usuario:', error);
    res.status(500).json({ message: 'Error al actualizar rol de usuario' });
  }
});

// Eliminar un usuario
adminRouter.delete('/users/:id', isAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const success = await storage.deleteUser(userId);
    
    if (!success) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json({ success: true, message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

// Otras rutas administrativas pueden ir aquí

export default adminRouter;