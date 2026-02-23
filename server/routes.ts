import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactMessageSchema, insertTestimonialSchema, insertProductSchema, insertAppointmentSchema, insertPatientSchema, insertInsuranceCompanySchema, insertMedicalVisitSchema, insertMedicalHistorySchema } from "@shared/schema";
import { ZodError } from "zod";
import { sendEmail, getContactNotificationTemplate, getContactAutoReplyTemplate, getAppointmentConfirmationTemplate, getContactReplyTemplate } from "./services/emailService";
import { processAssistantMessage } from "./services/assistant-service";
import settingsRouter from "./routes/settings";
import authRouter from "./routes/auth";
import notificationsRouter from "./routes/notifications";
import loyaltyRouter from "./routes/loyalty";
import icalRouter from "./routes/ical";
import staffRouter from "./routes/staff";
// uploadRouter se registra en index.ts antes del body parsing
import session from "express-session";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configurar sesión
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "fatimadiaz-clodina-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Permitir cookies en HTTP para compatibilidad con Replit
        httpOnly: true, // Prevenir acceso desde JavaScript del cliente
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 semana
        sameSite: 'lax', // Compatibilidad con redirecciones
      },
    })
  );
  
  // Registrar routers
  app.use("/api/settings", settingsRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/loyalty-points", loyaltyRouter);
  app.use("/api/ical", icalRouter);
  app.use("/api/staff", staffRouter);
  // Upload router ya está registrado en index.ts ANTES del body parsing
  
  // API routes
  
  // Get approved testimonials
  app.get("/api/testimonials", async (req: Request, res: Response) => {
    try {
      const testimonials = await storage.getApprovedTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
      res.status(500).json({ message: "Error fetching testimonials" });
    }
  });
  
  // Get all testimonials (for admin panel)
  app.get("/api/testimonials/all", async (req: Request, res: Response) => {
    try {
      const testimonials = await storage.getTestimonials();
      res.json(testimonials);
    } catch (error) {
      console.error("Error fetching all testimonials:", error);
      res.status(500).json({ message: "Error fetching all testimonials" });
    }
  });
  
  // Add a new testimonial
  app.post("/api/testimonials", async (req: Request, res: Response) => {
    try {
      const testimonialData = insertTestimonialSchema.parse(req.body);
      const testimonial = await storage.createTestimonial(testimonialData);
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid testimonial data", errors: error.errors });
      } else {
        console.error("Error creating testimonial:", error);
        res.status(500).json({ message: "Error creating testimonial" });
      }
    }
  });
  
  // Get blog posts
  app.get("/api/blog", async (req: Request, res: Response) => {
    try {
      const blogPosts = await storage.getBlogPosts();
      res.json(blogPosts);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({ message: "Error fetching blog posts" });
    }
  });
  
  // Get a single blog post by slug
  app.get("/api/blog/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const blogPost = await storage.getBlogPostBySlug(slug);
      
      if (!blogPost) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      res.json(blogPost);
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({ message: "Error fetching blog post" });
    }
  });
  
  // Create a new blog post
  app.post("/api/blog", async (req: Request, res: Response) => {
    try {
      const { title, slug, category, excerpt, content, imageUrl } = req.body;
      
      if (!title || !slug || !category || !excerpt || !content || !imageUrl) {
        return res.status(400).json({ message: "All blog post fields are required" });
      }
      
      // Comprobar si ya existe un post con ese slug
      const existingPost = await storage.getBlogPostBySlug(slug);
      if (existingPost) {
        return res.status(400).json({ message: "A blog post with that slug already exists" });
      }
      
      const blogPost = await storage.createBlogPost({
        title,
        slug,
        category,
        excerpt,
        content,
        imageUrl
      });
      
      res.status(201).json(blogPost);
    } catch (error) {
      console.error("Error creating blog post:", error);
      res.status(500).json({ message: "Error creating blog post" });
    }
  });
  
  // Update a blog post
  app.patch("/api/blog/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      const { title, slug, category, excerpt, content, imageUrl } = req.body;
      
      if (!title || !slug || !category || !excerpt || !content || !imageUrl) {
        return res.status(400).json({ message: "All blog post fields are required" });
      }
      
      // Verificar si el post existe
      const post = await storage.getBlogPost(id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Si el slug cambió, verificar que no exista otro post con ese slug
      if (slug !== post.slug) {
        const existingPost = await storage.getBlogPostBySlug(slug);
        if (existingPost && existingPost.id !== id) {
          return res.status(400).json({ message: "A blog post with that slug already exists" });
        }
      }
      
      // Actualizar el post (se debe implementar esta función en el storage)
      const updatedPost = await storage.updateBlogPost(id, {
        title,
        slug,
        category,
        excerpt,
        content,
        imageUrl
      });
      
      res.json(updatedPost);
    } catch (error) {
      console.error("Error updating blog post:", error);
      res.status(500).json({ message: "Error updating blog post" });
    }
  });
  
  // Delete a blog post
  app.delete("/api/blog/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid blog post ID" });
      }
      
      // Verificar si el post existe
      const post = await storage.getBlogPost(id);
      if (!post) {
        return res.status(404).json({ message: "Blog post not found" });
      }
      
      // Eliminar el post (se debe implementar esta función en el storage)
      await storage.deleteBlogPost(id);
      
      res.json({ message: "Blog post deleted successfully", id });
    } catch (error) {
      console.error("Error deleting blog post:", error);
      res.status(500).json({ message: "Error deleting blog post" });
    }
  });
  
  // Obtener todos los mensajes de contacto (admin)
  app.get("/api/contact", async (req: Request, res: Response) => {
    try {
      const contactMessages = await storage.getContactMessages();
      res.json(contactMessages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Error fetching contact messages" });
    }
  });
  
  // Marcar un mensaje como leído
  app.patch("/api/contact/:id/read", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact message ID" });
      }
      
      const message = await storage.getContactMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      
      // Actualizar el mensaje como leído usando el campo 'processed'
      // Utilizamos el campo processed existente como equivalente a 'read'
      const updatedMessage = await storage.updateContactMessageStatus(id, { processed: true });
      res.json({
        message: "Contact message marked as read",
        contactMessage: updatedMessage
      });
    } catch (error) {
      console.error("Error updating contact message:", error);
      res.status(500).json({ message: "Error updating contact message" });
    }
  });
  
  // Responder a un mensaje de contacto
  app.patch("/api/contact/:id/reply", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact message ID" });
      }
      
      const { reply } = req.body;
      if (!reply || typeof reply !== "string") {
        return res.status(400).json({ message: "Reply text is required" });
      }
      
      const message = await storage.getContactMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      
      // Enviar la respuesta por email
      try {
        if (message.email) {
          const replyTemplate = getContactReplyTemplate({
            name: message.name,
            originalSubject: message.subject,
            replyMessage: reply
          });
          
          const emailResult = await sendEmail({
            to: message.email,
            subject: replyTemplate.subject,
            html: replyTemplate.html,
            text: replyTemplate.text,
          });
          
          console.log("Email de respuesta enviado correctamente", emailResult.previewUrl);
          
          // Actualizar el mensaje como procesado
          const updatedMessage = await storage.updateContactMessageStatus(id, { 
            processed: true
          });
          
          res.json({
            message: "Reply sent successfully",
            contactMessage: updatedMessage,
            emailPreviewUrl: emailResult.previewUrl
          });
        } else {
          res.status(400).json({ message: "Contact message has no email address" });
        }
      } catch (emailError) {
        console.error("Error sending reply email:", emailError);
        res.status(500).json({ message: "Error sending reply email" });
      }
    } catch (error) {
      console.error("Error replying to contact message:", error);
      res.status(500).json({ message: "Error replying to contact message" });
    }
  });
  
  // Eliminar un mensaje de contacto
  app.delete("/api/contact/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid contact message ID" });
      }
      
      const message = await storage.getContactMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Contact message not found" });
      }
      
      await storage.deleteContactMessage(id);
      res.json({
        message: "Contact message deleted successfully",
        id
      });
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Error deleting contact message" });
    }
  });
  
  // Submit contact form
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const contactData = insertContactMessageSchema.parse(req.body);
      const contactMessage = await storage.createContactMessage(contactData);
      
      // Enviar notificación por email a los administradores
      try {
        const adminEmail = "admin@farmaciacentromedico.com"; // En producción, esto sería una variable de entorno
        const templateData = {
          name: contactData.name,
          email: contactData.email,
          subject: contactData.subject,
          message: contactData.message,
          phone: contactData.phone || undefined
        };
        
        const notificationTemplate = getContactNotificationTemplate(templateData);
        await sendEmail({
          to: adminEmail,
          subject: notificationTemplate.subject,
          html: notificationTemplate.html,
          text: notificationTemplate.text,
        });
        
        // Enviar email de confirmación al cliente
        if (contactData.email) {
          const autoReplyTemplate = getContactAutoReplyTemplate({
            name: contactData.name,
            subject: contactData.subject
          });
          
          await sendEmail({
            to: contactData.email,
            subject: autoReplyTemplate.subject,
            html: autoReplyTemplate.html,
            text: autoReplyTemplate.text,
          });
        }
        
        console.log("Emails de contacto enviados correctamente");
      } catch (emailError) {
        // No fallar la petición si hay un error en el envío de email
        console.error("Error al enviar emails de contacto:", emailError);
      }
      
      res.status(201).json({ 
        message: "Mensaje enviado con éxito. Nos pondremos en contacto con usted pronto.",
        id: contactMessage.id
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid contact data", errors: error.errors });
      } else {
        console.error("Error creating contact message:", error);
        res.status(500).json({ message: "Error sending contact message" });
      }
    }
  });
  
  // Productos API routes
  
  // Obtener todos los productos
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Error fetching products" });
    }
  });
  
  // Obtener productos destacados
  app.get("/api/products/featured", async (req: Request, res: Response) => {
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      res.json(featuredProducts);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Error fetching featured products" });
    }
  });
  
  // Obtener productos por categoría
  app.get("/api/products/category/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Error fetching products by category" });
    }
  });
  
  // Obtener producto individual
  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Error fetching product" });
    }
  });
  
  // Crear un nuevo producto
  app.post("/api/products", async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        console.error("Error creating product:", error);
        res.status(500).json({ message: "Error creating product" });
      }
    }
  });
  
  // Rutas de gestión de usuarios (admin)
  
  // Obtener todos los usuarios
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Aprobar/desaprobar usuario
  app.patch("/api/admin/users/:id/approval", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { isApproved } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.updateUserApproval(id, isApproved);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User approval status updated", user });
    } catch (error) {
      console.error("Error updating user approval:", error);
      res.status(500).json({ message: "Error updating user approval" });
    }
  });

  // Cambiar rol de usuario
  app.patch("/api/admin/users/:id/role", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { role } = req.body;
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.updateUserRole(id, role);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User role updated", user });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Error updating user role" });
    }
  });

  // Eliminar usuario
  app.delete("/api/admin/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Rutas de autenticación
  
  // Iniciar sesión
  // Registro de usuarios
  app.post("/api/auth/register", async (req: Request, res: Response) => {
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
        isApproved: false // Los usuarios deben ser aprobados por un administrador
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
  
  // Iniciar sesión
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      // Validación básica
      if (!username || !password) {
        return res.status(400).json({ 
          success: false,
          message: "Usuario y contraseña son requeridos" 
        });
      }
      
      // Autenticación para admin (mantener compatibilidad con implementación anterior)
      if (username === "admin" && password === "admin123") {
        req.session.userId = 1;
        req.session.userRole = "admin";
        
        return res.status(200).json({ 
          success: true,
          user: {
            id: 1,
            username: "admin",
            role: "admin"
          }
        });
      }
      
      // Autenticación para clientes registrados
      const user = await storage.getUserByUsername(username);
      
      if (user && user.password === password) {
        // Verificar que el usuario esté aprobado
        if (!user.isApproved) {
          return res.status(403).json({ 
            success: false,
            message: "Tu cuenta está pendiente de aprobación. Contacta con el administrador." 
          });
        }
        
        // Actualizar último login
        await storage.updateLastLogin(user.id);
        
        // Establecer sesión
        req.session.userId = user.id;
        req.session.userRole = user.role;
        
        // Excluir la contraseña de la respuesta
        const { password: _, ...userWithoutPassword } = user;
        
        return res.status(200).json({ 
          success: true,
          user: userWithoutPassword
        });
      } else {
        res.status(401).json({ 
          success: false,
          message: "Credenciales incorrectas" 
        });
      }
    } catch (error) {
      console.error("Error en inicio de sesión:", error);
      res.status(500).json({ 
        success: false,
        message: "Error al iniciar sesión" 
      });
    }
  });
  
  // Rutas para citas médicas
  
  // Obtener todas las citas (para administradores)
  app.get("/api/appointments", async (req: Request, res: Response) => {
    try {
      const appointments = await storage.getAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "Error fetching appointments" });
    }
  });

  // Obtener citas del usuario autenticado
  app.get("/api/user/appointments", async (req: Request, res: Response) => {
    try {
      if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "No autenticado" });
      }

      const userAppointments = await storage.getAppointmentsByUser(req.session.userId);
      res.json(userAppointments);
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      res.status(500).json({ message: "Error fetching user appointments" });
    }
  });
  
  // Crear una nueva cita
  app.post("/api/appointments", async (req: Request, res: Response) => {
    try {
      console.log("=== DEBUG: Datos recibidos en POST /api/appointments ===");
      console.log("Cuerpo de la petición:", JSON.stringify(req.body, null, 2));
      console.log("Tipo de specialtyId:", typeof req.body.specialtyId);
      console.log("Tipo de doctorId:", typeof req.body.doctorId);
      
      const appointmentData = insertAppointmentSchema.parse(req.body);
      
      // Si hay un usuario autenticado, asociar la cita con su ID
      let userId = null;
      if (req.session && req.session.userId) {
        userId = req.session.userId;
        console.log("Cita asociada al usuario ID:", userId);
      }
      
      const appointment = await storage.createAppointment({
        ...appointmentData,
        userId: userId
      });
      
      // Envío de email de confirmación opcional
      try {
        // Obtener datos de especialidad y doctor
        let specialtyName = "Sin especialidad";
        let doctorName = "Por asignar";
        
        if (appointment.specialtyId) {
          const specialty = await storage.getSpecialty(appointment.specialtyId);
          if (specialty) specialtyName = specialty.name;
        }
        
        if (appointment.doctorId) {
          const doctor = await storage.getDoctor(appointment.doctorId);
          if (doctor) doctorName = doctor.name;
        }
        
        const confirmationTemplate = getAppointmentConfirmationTemplate({
          name: appointment.name,
          email: appointment.email,
          date: appointment.date,
          time: appointment.time,
          specialty: specialtyName,
          doctor: doctorName
        });
        
        await sendEmail({
          to: appointment.email,
          subject: confirmationTemplate.subject,
          html: confirmationTemplate.html,
          text: confirmationTemplate.text,
        });
        
        console.log("Email de confirmación de cita enviado correctamente");
      } catch (emailError) {
        console.error("Error enviando email de confirmación:", emailError);
        // Continuamos con la respuesta exitosa aunque falle el email
      }
      
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        console.error("Error creating appointment:", error);
        res.status(500).json({ message: "Error creating appointment" });
      }
    }
  });
  
  // Obtener una cita específica
  app.get("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json(appointment);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ message: "Error fetching appointment" });
    }
  });
  

  // Actualizar una cita completa
  app.patch("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      // Validar datos de entrada
      const appointmentData = insertAppointmentSchema.partial().parse(req.body);
      
      const appointment = await storage.updateAppointment(id, appointmentData);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }
      
      res.json({
        message: "Appointment updated successfully",
        appointment
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid appointment data", errors: error.errors });
      } else {
        console.error("Error updating appointment:", error);
        res.status(500).json({ message: "Error updating appointment" });
      }
    }
  });
  
  // Actualizar el estado de una cita
  app.patch("/api/appointments/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid appointment ID" });
      }
      
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Status is required and must be a string" });
      }
      
      const appointment = await storage.updateAppointmentStatus(id, status);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      // Si el estado es "confirmada", enviar correo de confirmación
      if (status.toLowerCase() === "confirmada" && appointment.email) {
        try {
          // Obtener información del doctor y especialidad
          let doctorName = "Doctor asignado";
          let specialtyName = "Consulta general";
          
          if (appointment.doctorId) {
            const doctor = await storage.getDoctor(appointment.doctorId);
            if (doctor) {
              doctorName = doctor.name;
            }
          }
          
          if (appointment.specialtyId) {
            const specialty = await storage.getSpecialty(appointment.specialtyId);
            if (specialty) {
              specialtyName = specialty.name;
            }
          }

          // Formatear fecha y hora
          const appointmentDate = new Date(appointment.date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          // Importar dinámicamente el servicio de email
          const { sendEmail, getAppointmentConfirmationTemplate } = await import('./services/emailService');
          
          const emailTemplate = getAppointmentConfirmationTemplate({
            name: appointment.name,
            date: appointmentDate,
            time: appointment.time,
            doctor: doctorName,
            specialty: specialtyName,
            email: appointment.email
          });

          const emailResult = await sendEmail({
            to: appointment.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text
          });

          if (emailResult.success) {
            console.log(`Correo de confirmación enviado a ${appointment.email}`);
            if (emailResult.previewUrl) {
              console.log(`Vista previa: ${emailResult.previewUrl}`);
            }
          } else {
            console.error("Error enviando correo de confirmación:", emailResult.error);
          }
        } catch (emailError) {
          console.error("Error en el servicio de email:", emailError);
          // No fallar la actualización por problemas de email
        }
      }
      
      res.json({
        message: "Appointment status updated successfully",
        appointment
      });
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "Error updating appointment status" });
    }
  });
  
  // Eliminar una cita
  app.delete("/api/appointments/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "ID de cita inválido" });
      }
      
      // Primero verificamos que la cita exista
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ message: "Cita no encontrada" });
      }
      
      // Como no tenemos un método directo para eliminar, usamos updateAppointmentStatus 
      // para marcar la cita como cancelada
      const updatedAppointment = await storage.updateAppointmentStatus(id, "cancelada");
      
      res.json({
        message: "Cita eliminada con éxito",
        id
      });
    } catch (error) {
      console.error("Error al eliminar la cita:", error);
      res.status(500).json({ message: "Error al eliminar la cita" });
    }
  });

  // Endpoints para aseguradoras
  
  // Obtener todas las aseguradoras
  app.get("/api/insurance-companies", async (req: Request, res: Response) => {
    try {
      const companies = await storage.getInsuranceCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching insurance companies:", error);
      res.status(500).json({ message: "Error fetching insurance companies" });
    }
  });

  // Obtener una aseguradora específica
  app.get("/api/insurance-companies/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid insurance company ID" });
      }
      
      const company = await storage.getInsuranceCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Insurance company not found" });
      }
      
      res.json(company);
    } catch (error) {
      console.error("Error fetching insurance company:", error);
      res.status(500).json({ message: "Error fetching insurance company" });
    }
  });

  // Crear una nueva aseguradora
  app.post("/api/insurance-companies", async (req: Request, res: Response) => {
    try {
      const companyData = insertInsuranceCompanySchema.parse(req.body);
      const company = await storage.createInsuranceCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid insurance company data", errors: error.errors });
      } else {
        console.error("Error creating insurance company:", error);
        res.status(500).json({ message: "Error creating insurance company" });
      }
    }
  });

  // Actualizar una aseguradora
  app.put("/api/insurance-companies/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid insurance company ID" });
      }
      
      const companyData = insertInsuranceCompanySchema.parse(req.body);
      const company = await storage.updateInsuranceCompany(id, companyData);
      
      if (!company) {
        return res.status(404).json({ message: "Insurance company not found" });
      }
      
      res.json(company);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid insurance company data", errors: error.errors });
      } else {
        console.error("Error updating insurance company:", error);
        res.status(500).json({ message: "Error updating insurance company" });
      }
    }
  });

  // Eliminar una aseguradora
  app.delete("/api/insurance-companies/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid insurance company ID" });
      }
      
      const success = await storage.deleteInsuranceCompany(id);
      if (!success) {
        return res.status(404).json({ message: "Insurance company not found" });
      }
      
      res.json({ message: "Insurance company deleted successfully" });
    } catch (error) {
      console.error("Error deleting insurance company:", error);
      res.status(500).json({ message: "Error deleting insurance company" });
    }
  });

  // Medical visits routes
  app.get("/api/medical-visits", async (req: Request, res: Response) => {
    try {
      const visits = await storage.getMedicalVisits();
      res.json(visits);
    } catch (error) {
      console.error("Error fetching medical visits:", error);
      res.status(500).json({ message: "Error fetching medical visits" });
    }
  });

  app.get("/api/patients/:patientId/medical-visits", async (req: Request, res: Response) => {
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const visits = await storage.getMedicalVisitsByPatient(patientId);
      res.json(visits);
    } catch (error) {
      console.error("Error fetching patient medical visits:", error);
      res.status(500).json({ message: "Error fetching patient medical visits" });
    }
  });

  app.get("/api/medical-visits/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid medical visit ID" });
      }
      
      const visit = await storage.getMedicalVisit(id);
      if (!visit) {
        return res.status(404).json({ message: "Medical visit not found" });
      }
      
      res.json(visit);
    } catch (error) {
      console.error("Error fetching medical visit:", error);
      res.status(500).json({ message: "Error fetching medical visit" });
    }
  });

  app.post("/api/medical-visits", async (req: Request, res: Response) => {
    try {
      const visitData = insertMedicalVisitSchema.parse(req.body);
      const visit = await storage.createMedicalVisit(visitData);
      res.status(201).json(visit);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid medical visit data", errors: error.errors });
      } else {
        console.error("Error creating medical visit:", error);
        res.status(500).json({ message: "Error creating medical visit" });
      }
    }
  });

  app.put("/api/medical-visits/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid medical visit ID" });
      }
      
      const visitData = insertMedicalVisitSchema.parse(req.body);
      const visit = await storage.updateMedicalVisit(id, visitData);
      
      if (!visit) {
        return res.status(404).json({ message: "Medical visit not found" });
      }
      
      res.json(visit);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid medical visit data", errors: error.errors });
      } else {
        console.error("Error updating medical visit:", error);
        res.status(500).json({ message: "Error updating medical visit" });
      }
    }
  });

  app.delete("/api/medical-visits/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid medical visit ID" });
      }
      
      const success = await storage.deleteMedicalVisit(id);
      if (!success) {
        return res.status(404).json({ message: "Medical visit not found" });
      }
      
      res.json({ message: "Medical visit deleted successfully" });
    } catch (error) {
      console.error("Error deleting medical visit:", error);
      res.status(500).json({ message: "Error deleting medical visit" });
    }
  });

  // Medical history routes
  app.get("/api/patients/:patientId/medical-history", async (req: Request, res: Response) => {
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const history = await storage.getMedicalHistory(patientId);
      if (!history) {
        return res.status(404).json({ message: "Medical history not found" });
      }
      
      res.json(history);
    } catch (error) {
      console.error("Error fetching medical history:", error);
      res.status(500).json({ message: "Error fetching medical history" });
    }
  });

  app.post("/api/patients/:patientId/medical-history", async (req: Request, res: Response) => {
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const historyData = insertMedicalHistorySchema.parse(req.body);
      const history = await storage.createMedicalHistory({
        ...historyData,
        patientId
      });
      res.status(201).json(history);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid medical history data", errors: error.errors });
      } else {
        console.error("Error creating medical history:", error);
        res.status(500).json({ message: "Error creating medical history" });
      }
    }
  });

  app.put("/api/patients/:patientId/medical-history", async (req: Request, res: Response) => {
    try {
      const patientId = parseInt(req.params.patientId);
      if (isNaN(patientId)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const historyData = insertMedicalHistorySchema.parse(req.body);
      const history = await storage.updateMedicalHistory(patientId, historyData);
      
      if (!history) {
        return res.status(404).json({ message: "Error updating medical history" });
      }
      
      res.json(history);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid medical history data", errors: error.errors });
      } else {
        console.error("Error updating medical history:", error);
        res.status(500).json({ message: "Error updating medical history" });
      }
    }
  });

  // Endpoints para pacientes
  
  // Obtener todos los pacientes
  app.get("/api/patients", async (req: Request, res: Response) => {
    try {
      const patients = await storage.getPatients();
      res.json(patients);
    } catch (error) {
      console.error("Error fetching patients:", error);
      res.status(500).json({ message: "Error fetching patients" });
    }
  });

  // Obtener un paciente específico
  app.get("/api/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const patient = await storage.getPatient(id);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      console.error("Error fetching patient:", error);
      res.status(500).json({ message: "Error fetching patient" });
    }
  });

  // Crear un nuevo paciente
  app.post("/api/patients", async (req: Request, res: Response) => {
    try {
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(patientData);
      res.status(201).json(patient);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      } else {
        console.error("Error creating patient:", error);
        res.status(500).json({ message: "Error creating patient" });
      }
    }
  });

  // Actualizar un paciente
  app.put("/api/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const patientData = insertPatientSchema.parse(req.body);
      const patient = await storage.updatePatient(id, patientData);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Invalid patient data", errors: error.errors });
      } else {
        console.error("Error updating patient:", error);
        res.status(500).json({ message: "Error updating patient" });
      }
    }
  });

  // Eliminar un paciente
  app.delete("/api/patients/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid patient ID" });
      }
      
      const deleted = await storage.deletePatient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json({ message: "Patient deleted successfully" });
    } catch (error) {
      console.error("Error deleting patient:", error);
      res.status(500).json({ message: "Error deleting patient" });
    }
  });

  // Vincular paciente con usuario
  app.patch("/api/patients/:id/link-user", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { userId } = req.body;
      
      if (isNaN(id) || !userId) {
        return res.status(400).json({ message: "Invalid patient ID or user ID" });
      }
      
      const patient = await storage.linkPatientToUser(id, userId);
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      console.error("Error linking patient to user:", error);
      res.status(500).json({ message: "Error linking patient to user" });
    }
  });

  // Ruta para el asistente virtual
  app.post("/api/chat/assistant", async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          response: "Por favor, proporciona un mensaje válido.",
          suggestions: ["Pedir cita médica", "Ver servicios", "Contactar"]
        });
      }

      // Verificar si hay configuración de IA habilitada
      const useAI = process.env.PERPLEXITY_API_KEY ? true : false;
      
      const assistantResponse = await processAssistantMessage(message, context || [], useAI);
      
      res.json(assistantResponse);
    } catch (error) {
      console.error("Error en el asistente virtual:", error);
      res.status(500).json({ 
        response: "Disculpa, estoy teniendo dificultades técnicas en este momento. ¿Podrías intentarlo de nuevo?",
        suggestions: ["Contactar por teléfono", "Enviar email", "Intentar más tarde"]
      });
    }
  });

  // Configuración del asistente virtual (solo admin)
  app.get("/api/admin/assistant-config", async (req: Request, res: Response) => {
    try {
      // Por ahora devolvemos configuración por defecto
      // En el futuro esto se puede almacenar en base de datos
      const config = {
        enabled: true,
        useAI: !!process.env.PERPLEXITY_API_KEY,
        welcomeMessage: "¡Hola! Bienvenido/a al asistente virtual de Farmacia Fátima Díaz Guillén y Centro Médico Clodina.",
        fallbackMessage: "Lo siento, no estoy seguro de cómo responder a eso. ¿Podrías ser más específico?",
        suggestions: "Pedir cita médica,Ver servicios,Contactar,Horarios de atención"
      };
      
      res.json(config);
    } catch (error) {
      console.error("Error al obtener configuración del asistente:", error);
      res.status(500).json({ message: "Error al obtener configuración" });
    }
  });

  // Guardar configuración del asistente virtual (solo admin)
  app.put("/api/admin/assistant-config", async (req: Request, res: Response) => {
    try {
      // Por ahora solo confirmamos que se recibió
      // En el futuro esto se guardará en base de datos
      console.log("Configuración del asistente recibida:", req.body);
      
      res.json({ 
        message: "Configuración guardada exitosamente",
        config: req.body 
      });
    } catch (error) {
      console.error("Error al guardar configuración del asistente:", error);
      res.status(500).json({ message: "Error al guardar configuración" });
    }
  });

  // Probar conexión con IA (solo admin)
  app.post("/api/admin/test-ai", async (req: Request, res: Response) => {
    try {
      const { message } = req.body;
      
      if (!process.env.PERPLEXITY_API_KEY) {
        return res.status(400).json({ 
          message: "Clave API de Perplexity no configurada. Configúrala en las variables de entorno." 
        });
      }
      
      // Probar con Perplexity
      const assistantResponse = await processAssistantMessage(message, [], true);
      
      res.json({
        response: assistantResponse.response,
        status: "success"
      });
    } catch (error) {
      console.error("Error en prueba de IA:", error);
      res.status(500).json({ 
        message: "Error al conectar con Perplexity AI. Verifica la clave API.",
        response: "Error de conexión con el servicio de IA"
      });
    }
  });

  // Rutas para especialidades
  
  // Obtener todas las especialidades
  app.get("/api/specialties", async (req: Request, res: Response) => {
    try {
      const specialties = await storage.getSpecialties();
      res.json(specialties);
    } catch (error) {
      console.error("Error fetching specialties:", error);
      res.status(500).json({ message: "Error fetching specialties" });
    }
  });

  // Crear especialidad
  app.post("/api/specialties", async (req: Request, res: Response) => {
    try {
      const specialty = await storage.createSpecialty(req.body);
      res.status(201).json(specialty);
    } catch (error) {
      console.error("Error creating specialty:", error);
      res.status(500).json({ message: "Error creating specialty" });
    }
  });

  // Actualizar especialidad
  app.patch("/api/specialties/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const specialty = await storage.updateSpecialty(id, req.body);
      
      if (!specialty) {
        return res.status(404).json({ message: "Specialty not found" });
      }
      
      res.json(specialty);
    } catch (error) {
      console.error("Error updating specialty:", error);
      res.status(500).json({ message: "Error updating specialty" });
    }
  });

  // Eliminar especialidad
  app.delete("/api/specialties/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSpecialty(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Specialty not found" });
      }
      
      res.json({ message: "Specialty deleted successfully" });
    } catch (error) {
      console.error("Error deleting specialty:", error);
      res.status(500).json({ message: "Error deleting specialty" });
    }
  });

  // Rutas para doctores
  
  // Obtener todos los doctores
  app.get("/api/doctors", async (req: Request, res: Response) => {
    try {
      const doctors = await storage.getDoctors();
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      res.status(500).json({ message: "Error fetching doctors" });
    }
  });

  // Obtener doctores por especialidad
  app.get("/api/doctors/specialty/:specialtyId", async (req: Request, res: Response) => {
    try {
      const specialtyId = parseInt(req.params.specialtyId);
      const doctors = await storage.getDoctorsBySpecialty(specialtyId);
      res.json(doctors);
    } catch (error) {
      console.error("Error fetching doctors by specialty:", error);
      res.status(500).json({ message: "Error fetching doctors by specialty" });
    }
  });

  // Crear doctor
  app.post("/api/doctors", async (req: Request, res: Response) => {
    try {
      const doctor = await storage.createDoctor(req.body);
      res.status(201).json(doctor);
    } catch (error) {
      console.error("Error creating doctor:", error);
      res.status(500).json({ message: "Error creating doctor" });
    }
  });

  // Actualizar doctor
  app.patch("/api/doctors/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const doctor = await storage.updateDoctor(id, req.body);
      
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      res.json(doctor);
    } catch (error) {
      console.error("Error updating doctor:", error);
      res.status(500).json({ message: "Error updating doctor" });
    }
  });

  // Archivar doctor (eliminación lógica)
  app.delete("/api/doctors/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const archived = await storage.deleteDoctor(id);
      
      if (!archived) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      res.json({ message: "Doctor archived successfully" });
    } catch (error) {
      console.error("Error archiving doctor:", error);
      res.status(500).json({ message: "Error archiving doctor" });
    }
  });

  // Archivar doctor explícitamente
  app.patch("/api/doctors/:id/archive", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const archived = await storage.archiveDoctor(id);
      
      if (!archived) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      res.json({ message: "Doctor archived successfully" });
    } catch (error) {
      console.error("Error archiving doctor:", error);
      res.status(500).json({ message: "Error archiving doctor" });
    }
  });

  // Activar doctor
  app.patch("/api/doctors/:id/activate", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const activated = await storage.activateDoctor(id);
      
      if (!activated) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      
      res.json({ message: "Doctor activated successfully" });
    } catch (error) {
      console.error("Error activating doctor:", error);
      res.status(500).json({ message: "Error activating doctor" });
    }
  });

  const httpServer = createServer(app);
  // Rutas para gestión de horarios de doctores
  
  // Obtener horarios de un doctor
  app.get("/api/doctors/:doctorId/schedules", async (req: Request, res: Response) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const schedules = await storage.getDoctorSchedules(doctorId);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching doctor schedules:", error);
      res.status(500).json({ message: "Error fetching doctor schedules" });
    }
  });

  // Crear horario para un doctor
  app.post("/api/doctors/:doctorId/schedules", async (req: Request, res: Response) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const scheduleData = {
        ...req.body,
        doctorId
      };
      const schedule = await storage.createDoctorSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating doctor schedule:", error);
      res.status(500).json({ message: "Error creating doctor schedule" });
    }
  });

  // Actualizar horario de doctor
  app.patch("/api/schedules/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const schedule = await storage.updateDoctorSchedule(id, req.body);
      
      if (!schedule) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json(schedule);
    } catch (error) {
      console.error("Error updating doctor schedule:", error);
      res.status(500).json({ message: "Error updating doctor schedule" });
    }
  });

  // Eliminar horario de doctor
  app.delete("/api/schedules/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDoctorSchedule(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Schedule not found" });
      }
      
      res.json({ message: "Schedule deleted successfully" });
    } catch (error) {
      console.error("Error deleting doctor schedule:", error);
      res.status(500).json({ message: "Error deleting doctor schedule" });
    }
  });

  // Rutas para excepciones de horario
  
  // Obtener excepciones de un doctor
  app.get("/api/doctors/:doctorId/exceptions", async (req: Request, res: Response) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const { startDate, endDate } = req.query;
      const exceptions = await storage.getDoctorExceptions(
        doctorId,
        startDate as string,
        endDate as string
      );
      res.json(exceptions);
    } catch (error) {
      console.error("Error fetching doctor exceptions:", error);
      res.status(500).json({ message: "Error fetching doctor exceptions" });
    }
  });

  // Crear excepción para un doctor
  app.post("/api/doctors/:doctorId/exceptions", async (req: Request, res: Response) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const exceptionData = {
        ...req.body,
        doctorId
      };
      const exception = await storage.createDoctorException(exceptionData);
      res.status(201).json(exception);
    } catch (error) {
      console.error("Error creating doctor exception:", error);
      res.status(500).json({ message: "Error creating doctor exception" });
    }
  });

  // Actualizar excepción de doctor
  app.patch("/api/exceptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const exception = await storage.updateDoctorException(id, req.body);
      
      if (!exception) {
        return res.status(404).json({ message: "Exception not found" });
      }
      
      res.json(exception);
    } catch (error) {
      console.error("Error updating doctor exception:", error);
      res.status(500).json({ message: "Error updating doctor exception" });
    }
  });

  // Eliminar excepción de doctor
  app.delete("/api/exceptions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteDoctorException(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Exception not found" });
      }
      
      res.json({ message: "Exception deleted successfully" });
    } catch (error) {
      console.error("Error deleting doctor exception:", error);
      res.status(500).json({ message: "Error deleting doctor exception" });
    }
  });

  // Rutas para duraciones de citas por especialidad
  
  // Obtener todas las duraciones de citas
  app.get("/api/appointment-durations", async (req: Request, res: Response) => {
    try {
      const durations = await storage.getAppointmentDurations();
      res.json(durations);
    } catch (error) {
      console.error("Error fetching appointment durations:", error);
      res.status(500).json({ message: "Error fetching appointment durations" });
    }
  });

  // Crear duración de cita
  app.post("/api/appointment-durations", async (req: Request, res: Response) => {
    try {
      const duration = await storage.createAppointmentDuration(req.body);
      res.status(201).json(duration);
    } catch (error) {
      console.error("Error creating appointment duration:", error);
      res.status(500).json({ message: "Error creating appointment duration" });
    }
  });

  // Rutas para disponibilidad
  
  // Obtener horarios disponibles de un doctor para una fecha específica
  app.get("/api/doctors/:doctorId/available-slots", async (req: Request, res: Response) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const { date, specialtyId } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const availableSlots = await storage.getDoctorAvailableSlots(
        doctorId,
        date as string,
        specialtyId ? parseInt(specialtyId as string) : undefined
      );
      
      res.json({ availableSlots });
    } catch (error) {
      console.error("Error fetching available slots:", error);
      res.status(500).json({ message: "Error fetching available slots" });
    }
  });

  // Obtener citas de un doctor para una fecha específica
  app.get("/api/doctors/:doctorId/appointments", async (req: Request, res: Response) => {
    try {
      const doctorId = parseInt(req.params.doctorId);
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const appointments = await storage.getAppointmentsByDoctorAndDate(
        doctorId,
        date as string
      );
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      res.status(500).json({ message: "Error fetching doctor appointments" });
    }
  });

  return httpServer;
}
