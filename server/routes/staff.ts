import express from "express";
import { storage } from "../storage";
import { insertStaffSchema } from "@shared/schema";
import { ZodError } from "zod";

const router = express.Router();

// Middleware to check admin authentication
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.session?.user || req.session.user.role !== "admin") {
    return res.status(401).json({ message: "Acceso denegado. Se requieren permisos de administrador." });
  }
  next();
};

// Get all staff members
router.get("/", async (req, res) => {
  try {
    const staff = await storage.getStaff();
    res.json(staff);
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Get staff by department
router.get("/department/:department", async (req, res) => {
  try {
    const { department } = req.params;
    const staff = await storage.getStaffByDepartment(department);
    res.json(staff);
  } catch (error) {
    console.error("Error fetching staff by department:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Get active staff only
router.get("/active", async (req, res) => {
  try {
    console.log("[STAFF] Obteniendo personal activo");
    const staff = await storage.getActiveStaff();
    console.log(`[STAFF] Personal activo encontrado: ${staff.length} miembros`);
    staff.forEach(member => {
      console.log(`[STAFF] - ${member.name} (ID: ${member.id}, Status: ${member.status})`);
    });
    res.json(staff);
  } catch (error) {
    console.error("Error fetching active staff:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Get single staff member
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const member = await storage.getStaffMember(id);
    if (!member) {
      return res.status(404).json({ message: "Miembro del personal no encontrado" });
    }

    res.json(member);
  } catch (error) {
    console.error("Error fetching staff member:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Create new staff member (temporalmente sin autenticación)
router.post("/", async (req, res) => {
  try {
    const staffData = insertStaffSchema.parse(req.body);
    const newMember = await storage.createStaffMember(staffData);
    res.status(201).json(newMember);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Datos inválidos", 
        errors: error.errors 
      });
    }
    console.error("Error creating staff member:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Update staff member (temporalmente sin autenticación)
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const staffData = insertStaffSchema.partial().parse(req.body);
    const updatedMember = await storage.updateStaffMember(id, staffData);
    
    if (!updatedMember) {
      return res.status(404).json({ message: "Miembro del personal no encontrado" });
    }

    res.json(updatedMember);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ 
        message: "Datos inválidos", 
        errors: error.errors 
      });
    }
    console.error("Error updating staff member:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Archive staff member (temporalmente sin autenticación)
router.patch("/:id/archive", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const archivedMember = await storage.archiveStaffMember(id);
    
    if (!archivedMember) {
      return res.status(404).json({ message: "Miembro del personal no encontrado" });
    }

    res.json(archivedMember);
  } catch (error) {
    console.error("Error archiving staff member:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

// Delete staff member (temporalmente sin autenticación)
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido" });
    }

    const deleted = await storage.deleteStaffMember(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Miembro del personal no encontrado" });
    }

    res.json({ message: "Miembro del personal eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting staff member:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

export default router;