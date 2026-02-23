import { 
  users, 
  testimonials, 
  blogPosts, 
  contactMessages,
  products,
  appointments,
  specialties,
  doctors,
  type User, 
  type InsertUser,
  type Testimonial,
  type InsertTestimonial,
  type BlogPost,
  type InsertBlogPost,
  type ContactMessage,
  type InsertContactMessage,
  type Product,
  type InsertProduct,
  type Appointment,
  type InsertAppointment,
  type Specialty,
  type InsertSpecialty,
  type Doctor,
  type InsertDoctor
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  verifyUser(token: string): Promise<User | undefined>;
  updatePassword(id: number, newPassword: string): Promise<User | undefined>;
  setResetPasswordToken(email: string, token: string): Promise<User | undefined>;
  getUserByResetPasswordToken(token: string): Promise<User | undefined>;
  updateLastLogin(id: number): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserApproval(id: number, isApproved: boolean): Promise<User | undefined>;
  updateUserRole(id: number, role: string): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Testimonial operations
  getTestimonials(): Promise<Testimonial[]>;
  getApprovedTestimonials(): Promise<Testimonial[]>;
  getTestimonial(id: number): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Blog operations
  getBlogPosts(): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(blogPost: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, blogPostData: Partial<BlogPost>): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number): Promise<boolean>;
  
  // Contact operations
  getContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(contactMessage: InsertContactMessage): Promise<ContactMessage>;
  updateContactMessageStatus(id: number, status: {
    processed?: boolean;
  }): Promise<ContactMessage | undefined>;
  deleteContactMessage(id: number): Promise<boolean>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Appointment operations
  getAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByUser(userId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;
  
  // Specialty operations
  getSpecialties(): Promise<Specialty[]>;
  getSpecialty(id: number): Promise<Specialty | undefined>;
  createSpecialty(specialty: InsertSpecialty): Promise<Specialty>;
  updateSpecialty(id: number, specialtyData: Partial<Specialty>): Promise<Specialty | undefined>;
  deleteSpecialty(id: number): Promise<boolean>;
  
  // Doctor operations
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: number): Promise<Doctor | undefined>;
  getDoctorsBySpecialty(specialtyId: number): Promise<Doctor[]>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: number, doctorData: Partial<Doctor>): Promise<Doctor | undefined>;
  deleteDoctor(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private testimonials: Map<number, Testimonial>;
  private blogPosts: Map<number, BlogPost>;
  private contactMessages: Map<number, ContactMessage>;
  private products: Map<number, Product>;
  private appointments: Map<number, Appointment>;
  private notifications: Map<number, Notification>;
  private loyaltyPoints: Map<number, LoyaltyPointsHistory>;
  private userCurrentId: number;
  private testimonialCurrentId: number;
  private blogPostCurrentId: number;
  private contactMessageCurrentId: number;
  private productCurrentId: number;
  private appointmentCurrentId: number;
  private notificationCurrentId: number;
  private loyaltyPointsCurrentId: number;

  constructor() {
    this.users = new Map();
    this.testimonials = new Map();
    this.blogPosts = new Map();
    this.contactMessages = new Map();
    this.products = new Map();
    this.appointments = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.favorites = new Map();
    this.userCurrentId = 1;
    this.testimonialCurrentId = 1;
    this.blogPostCurrentId = 1;
    this.contactMessageCurrentId = 1;
    this.productCurrentId = 1;
    this.appointmentCurrentId = 1;
    this.orderCurrentId = 1;
    this.orderItemCurrentId = 1;
    this.favoriteCurrentId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Add some sample blog posts
    this.createBlogPost({
      title: "Cómo prepararse para su consulta médica",
      slug: "como-prepararse-para-su-consulta-medica",
      category: "Salud general",
      content: "Consejos prácticos para aprovechar al máximo su cita con el médico y asegurar una comunicación efectiva. Preparar una lista de preguntas, llevar un registro de síntomas y ser honesto con su médico son clave para una consulta productiva.",
      excerpt: "Consejos prácticos para aprovechar al máximo su cita con el médico y asegurar una comunicación efectiva.",
      imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=300"
    });
    
    this.createBlogPost({
      title: "Vitaminas esenciales para reforzar el sistema inmune",
      slug: "vitaminas-esenciales-para-reforzar-el-sistema-inmune",
      category: "Nutrición",
      content: "Descubra qué vitaminas y minerales son fundamentales para fortalecer sus defensas naturales. La vitamina C, D, zinc y selenio juegan un papel crucial en mantener un sistema inmunológico saludable y fuerte.",
      excerpt: "Descubra qué vitaminas y minerales son fundamentales para fortalecer sus defensas naturales.",
      imageUrl: "https://pixabay.com/get/g38d7104c847af731f667324fa972943e44404157d4906037c5d6f5f96b332b0f634c1f732ce566eb1d70f17e478247bd032121a5b91b6ead770778061dab1d28_1280.jpg"
    });
    
    this.createBlogPost({
      title: "Rutina de cuidado facial para pieles sensibles",
      slug: "rutina-de-cuidado-facial-para-pieles-sensibles",
      category: "Dermatología",
      content: "Guía completa para el cuidado diario de pieles sensibles, recomendada por nuestros dermatólogos. Aprenda qué ingredientes evitar y cuáles son beneficiosos para su tipo de piel específico.",
      excerpt: "Guía completa para el cuidado diario de pieles sensibles, recomendada por nuestros dermatólogos.",
      imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=300"
    });
    
    // Add sample testimonials
    this.createTestimonial({
      name: "Carmen García",
      role: "Cliente habitual",
      content: "El servicio es excelente. Los farmacéuticos siempre están dispuestos a resolver mis dudas y ofrecerme asesoramiento personalizado.",
      rating: 5
    });
    
    this.createTestimonial({
      name: "Juan Martínez",
      role: "Paciente del Centro Médico",
      content: "La atención en el Centro Médico Clodina es inmejorable. Los médicos son profesionales y cercanos, explicando todo con claridad.",
      rating: 4
    });
    
    this.createTestimonial({
      name: "Elena Rodríguez",
      role: "Cliente ocasional",
      content: "Encontré en su farmacia productos específicos que no había encontrado en otros lugares. El personal fue muy amable y me ayudó a elegir.",
      rating: 4
    });
    
    // Set all testimonials as approved
    Array.from(this.testimonials.entries()).forEach(([id, testimonial]) => {
      this.testimonials.set(id, { ...testimonial, approved: true });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      isVerified: false,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { 
      ...user, 
      ...userData,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async verifyUser(token: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(u => u.verificationToken === token);
    if (!user) return undefined;
    
    const verifiedUser = {
      ...user,
      isVerified: true,
      verificationToken: null,
      updatedAt: new Date()
    };
    this.users.set(user.id, verifiedUser);
    return verifiedUser;
  }
  
  async updatePassword(id: number, newPassword: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      password: newPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async setResetPasswordToken(email: string, token: string): Promise<User | undefined> {
    const user = Array.from(this.users.values()).find(u => u.email === email);
    if (!user) return undefined;
    
    // Set token expiration for 1 hour
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);
    
    const updatedUser = {
      ...user,
      resetPasswordToken: token,
      resetPasswordExpires: expires,
      updatedAt: new Date()
    };
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }
  
  async getUserByResetPasswordToken(token: string): Promise<User | undefined> {
    const now = new Date();
    return Array.from(this.users.values()).find(u => 
      u.resetPasswordToken === token && 
      u.resetPasswordExpires && 
      new Date(u.resetPasswordExpires) > now
    );
  }
  
  async updateLastLogin(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      lastLogin: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Testimonial operations
  async getTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values());
  }
  
  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return Array.from(this.testimonials.values()).filter(
      (testimonial) => testimonial.approved
    );
  }
  
  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    return this.testimonials.get(id);
  }
  
  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialCurrentId++;
    const testimonial: Testimonial = { 
      ...insertTestimonial, 
      id, 
      date: new Date(), 
      approved: false 
    };
    this.testimonials.set(id, testimonial);
    return testimonial;
  }
  
  // Blog operations
  async getBlogPosts(): Promise<BlogPost[]> {
    return Array.from(this.blogPosts.values()).sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }
  
  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    return this.blogPosts.get(id);
  }
  
  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    return Array.from(this.blogPosts.values()).find(
      (blogPost) => blogPost.slug === slug
    );
  }
  
  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const id = this.blogPostCurrentId++;
    const blogPost: BlogPost = { 
      ...insertBlogPost, 
      id,
      publishDate: new Date()
    };
    this.blogPosts.set(id, blogPost);
    return blogPost;
  }
  
  async updateBlogPost(id: number, blogPostData: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const existingBlogPost = this.blogPosts.get(id);
    
    if (!existingBlogPost) {
      return undefined;
    }
    
    const updatedBlogPost: BlogPost = { 
      ...existingBlogPost, 
      ...blogPostData,
      // No actualizamos la fecha de publicación para mantener la original
    };
    
    this.blogPosts.set(id, updatedBlogPost);
    return updatedBlogPost;
  }
  
  async deleteBlogPost(id: number): Promise<boolean> {
    if (!this.blogPosts.has(id)) {
      return false;
    }
    
    return this.blogPosts.delete(id);
  }
  
  // Contact operations
  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }
  
  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }
  
  async createContactMessage(insertContactMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageCurrentId++;
    const { phone, ...rest } = insertContactMessage;
    const contactMessage: ContactMessage = { 
      ...rest, 
      id,
      date: new Date(),
      processed: false,
      notes: null,
      phone: phone || null
    };
    this.contactMessages.set(id, contactMessage);
    return contactMessage;
  }
  
  async updateContactMessageStatus(id: number, status: {
    processed?: boolean;
  }): Promise<ContactMessage | undefined> {
    const message = this.contactMessages.get(id);
    if (!message) {
      return undefined;
    }
    
    const updatedMessage = { ...message };
    if (status.processed !== undefined) {
      updatedMessage.processed = status.processed;
    }
    
    this.contactMessages.set(id, updatedMessage);
    return updatedMessage;
  }
  
  async deleteContactMessage(id: number): Promise<boolean> {
    return this.contactMessages.delete(id);
  }
  
  // Product operations
  async getProducts(): Promise<Product[]> {
    return [];
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return [];
  }
  
  async getProductsByCategory(category: string): Promise<Product[]> {
    return [];
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return undefined;
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    throw new Error("Not implemented");
  }
  
  // Appointment operations
  async getAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }
  
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(appointment => appointment.userId === userId);
  }
  
  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const appointmentId = this.appointmentCurrentId++;
    const now = new Date();
    
    const newAppointment: Appointment = {
      id: appointmentId,
      name: appointment.name,
      email: appointment.email,
      phone: appointment.phone,
      date: appointment.date,
      time: appointment.time || "12:00",
      specialtyId: appointment.specialtyId || null,
      doctorId: appointment.doctorId || null,
      reason: appointment.reason,
      insurance: appointment.insurance || null,
      notes: appointment.notes || null,
      status: appointment.status || "pendiente",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    };
    
    this.appointments.set(appointmentId, newAppointment);
    return newAppointment;
  }
  
  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) {
      return undefined;
    }
    
    const updatedAppointment: Appointment = {
      ...appointment,
      status: status,
      updatedAt: new Date().toISOString()
    };
    
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }
}
