import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model (for admin and customer access)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  role: text("role").notNull().default("customer"),
  isApproved: boolean("is_approved").default(false).notNull(),
  isVerified: boolean("is_verified").default(false),
  verificationToken: text("verification_token"),
  resetPasswordToken: text("reset_password_token"),
  resetPasswordExpires: timestamp("reset_password_expires"),
  lastLogin: timestamp("last_login"),
  // Sistema de puntos de fidelización
  loyaltyPoints: integer("loyalty_points").default(0).notNull(),
  // Preferencias de email
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  phone: true,
  address: true,
  city: true,
  postalCode: true,
  role: true,
  isApproved: true,
});

// Testimonial model
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  rating: integer("rating").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  approved: boolean("approved").default(false).notNull(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).pick({
  name: true,
  role: true,
  content: true,
  rating: true,
});

// Blog post model
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  imageUrl: text("image_url").notNull(),
  publishDate: timestamp("publish_date").defaultNow().notNull(),
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).pick({
  title: true,
  slug: true,
  category: true,
  content: true,
  excerpt: true,
  imageUrl: true,
});

// Contact form model
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  processed: boolean("processed").default(false).notNull(),
  notes: text("notes"),
  reply: text("reply"),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).pick({
  name: true,
  email: true,
  phone: true,
  subject: true,
  message: true,
});

// Para actualizar mensajes de contacto
export const updateContactMessageSchema = createInsertSchema(contactMessages).pick({
  processed: true,
  notes: true,
  reply: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

// Productos destacados
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  price: text("price").notNull(), // Almacenamos como texto para simplificar
  imageUrl: text("image_url").notNull(),
  discount: integer("discount"),
  inStock: boolean("in_stock").default(true).notNull(),
  featured: boolean("featured").default(false).notNull(),
  dateAdded: timestamp("date_added").defaultNow().notNull()
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  category: true,
  description: true,
  price: true,
  imageUrl: true,
  discount: true,
  inStock: true,
  featured: true
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// Especialidades médicas
export const specialties = pgTable("specialties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSpecialtySchema = createInsertSchema(specialties).pick({
  name: true,
  description: true,
  active: true,
});

export type Specialty = typeof specialties.$inferSelect;
export type InsertSpecialty = z.infer<typeof insertSpecialtySchema>;

// Doctores
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  specialtyId: integer("specialty_id").references(() => specialties.id),
  licenseNumber: text("license_number"),
  experience: text("experience"),
  bio: text("bio"),
  schedule: text("schedule"), // JSON string con horarios disponibles
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDoctorSchema = createInsertSchema(doctors).pick({
  name: true,
  email: true,
  phone: true,
  specialtyId: true,
  licenseNumber: true,
  experience: true,
  bio: true,
  schedule: true,
  active: true,
});

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;

// Tabla de horarios de disponibilidad de doctores
export const doctorSchedules = pgTable("doctor_schedules", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0=domingo, 1=lunes, ..., 6=sábado
  startTime: text("start_time").notNull(), // formato "09:00"
  endTime: text("end_time").notNull(), // formato "17:00"
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDoctorScheduleSchema = createInsertSchema(doctorSchedules).omit({
  id: true,
  createdAt: true,
});

export type DoctorSchedule = typeof doctorSchedules.$inferSelect;
export type InsertDoctorSchedule = z.infer<typeof insertDoctorScheduleSchema>;

// Tabla de excepciones de horario (días no disponibles, vacaciones, etc.)
export const doctorExceptions = pgTable("doctor_exceptions", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  date: text("date").notNull(), // formato "2024-01-15"
  startTime: text("start_time"), // si null, todo el día no disponible
  endTime: text("end_time"), // si null, todo el día no disponible
  reason: text("reason"), // "Vacaciones", "Conferencia", etc.
  isAvailable: boolean("is_available").default(false).notNull(), // false = no disponible, true = disponible excepcionalmente
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDoctorExceptionSchema = createInsertSchema(doctorExceptions).omit({
  id: true,
  createdAt: true,
});

export type DoctorException = typeof doctorExceptions.$inferSelect;
export type InsertDoctorException = z.infer<typeof insertDoctorExceptionSchema>;

// Tabla de configuración de duraciones de citas por especialidad
export const appointmentDurations = pgTable("appointment_durations", {
  id: serial("id").primaryKey(),
  specialtyId: integer("specialty_id").references(() => specialties.id).notNull(),
  duration: integer("duration").default(30).notNull(), // duración en minutos
  description: text("description"),
});

export const insertAppointmentDurationSchema = createInsertSchema(appointmentDurations).omit({
  id: true,
});

export type AppointmentDuration = typeof appointmentDurations.$inferSelect;
export type InsertAppointmentDuration = z.infer<typeof insertAppointmentDurationSchema>;

// Tabla de pacientes (fichas médicas)
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Referencia opcional al usuario registrado
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth"), // formato "1990-01-15"
  gender: text("gender"), // "M", "F", "Otro"
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  identificationNumber: text("identification_number"), // DNI/NIE
  insuranceCompanyId: integer("insurance_company_id").references(() => insuranceCompanies.id),
  insuranceNumber: text("insurance_number"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  medicalHistory: text("medical_history"), // Historial médico general
  allergies: text("allergies"), // Alergias conocidas
  currentMedications: text("current_medications"), // Medicamentos actuales
  bloodType: text("blood_type"), // Grupo sanguíneo
  notes: text("notes"), // Notas adicionales del médico
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

// Tabla de aseguradoras/compañías de seguros
export const insuranceCompanies = pgTable("insurance_companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(), // Código identificativo (ej: "SANITAS", "MAPFRE")
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  address: text("address"),
  city: text("city"),
  postalCode: text("postal_code"),
  coverageTypes: text("coverage_types").array(), // Tipos de cobertura que ofrece
  notes: text("notes"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInsuranceCompanySchema = createInsertSchema(insuranceCompanies).omit({
  id: true,
  createdAt: true,
});

export type InsuranceCompany = typeof insuranceCompanies.$inferSelect;
export type InsertInsuranceCompany = z.infer<typeof insertInsuranceCompanySchema>;

// Medical Visits table
export const medicalVisits = pgTable("medical_visits", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull(),
  doctorId: integer("doctor_id").references(() => doctors.id).notNull(),
  appointmentId: integer("appointment_id").references(() => appointments.id),
  visitDate: timestamp("visit_date").defaultNow().notNull(),
  visitType: text("visit_type").notNull(), // 'consulta', 'revision', 'urgencia', 'seguimiento'
  chiefComplaint: text("chief_complaint"), // Motivo de consulta
  symptoms: text("symptoms"), // Síntomas
  examination: text("examination"), // Exploración física
  diagnosis: text("diagnosis"), // Diagnóstico
  treatment: text("treatment"), // Tratamiento
  medications: text("medications").array(), // Medicamentos prescritos
  notes: text("notes"), // Notas adicionales
  nextVisitDate: timestamp("next_visit_date"), // Próxima cita sugerida
  previousVisitId: integer("previous_visit_id"), // Visita anterior relacionada
  status: text("status").default("completed"), // 'completed', 'pending', 'cancelled'
  attachments: text("attachments").array(), // Archivos adjuntos (URLs)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMedicalVisitSchema = createInsertSchema(medicalVisits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MedicalVisit = typeof medicalVisits.$inferSelect;
export type InsertMedicalVisit = z.infer<typeof insertMedicalVisitSchema>;

// Medical History table (resumen del historial del paciente)
export const medicalHistory = pgTable("medical_history", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").references(() => patients.id).notNull().unique(),
  allergies: text("allergies").array(), // Alergias conocidas
  chronicConditions: text("chronic_conditions").array(), // Condiciones crónicas
  currentMedications: text("current_medications").array(), // Medicamentos actuales
  surgicalHistory: text("surgical_history").array(), // Historial quirúrgico
  familyHistory: text("family_history"), // Antecedentes familiares
  socialHistory: text("social_history"), // Historia social (hábitos, trabajo, etc.)
  bloodType: text("blood_type"), // Tipo de sangre
  emergencyContact: text("emergency_contact"), // Contacto de emergencia
  notes: text("notes"), // Notas generales
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMedicalHistorySchema = createInsertSchema(medicalHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type MedicalHistory = typeof medicalHistory.$inferSelect;
export type InsertMedicalHistory = z.infer<typeof insertMedicalHistorySchema>;

// Esquema para citas médicas
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  patientId: integer("patient_id").references(() => patients.id), // Referencia al paciente
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  date: text("date").notNull(), // Guardaremos la fecha como texto en formato ISO
  time: text("time").notNull(),
  specialtyId: integer("specialty_id").references(() => specialties.id),
  doctorId: integer("doctor_id").references(() => doctors.id),
  reason: text("reason").notNull(),
  insurance: text("insurance"),
  notes: text("notes"),
  status: text("status").default("pendiente").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true
}).extend({
  status: z.string().default("pendiente")
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

// Tabla de pedidos
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  orderDate: timestamp("order_date").defaultNow().notNull(),
  status: text("status").default("pendiente").notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(),
  shippingAddress: text("shipping_address"),
  shippingCity: text("shipping_city"),
  shippingPostalCode: text("shipping_postal_code"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderDate: true,
  updatedAt: true,
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// Tabla de líneas de pedido
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  discount: integer("discount"),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// Tabla de favoritos/wishlist
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  addedAt: true,
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

// Tabla de notificaciones
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'info', 'success', 'warning', 'error'
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Tabla de historial de puntos de fidelización
export const loyaltyPointsHistory = pgTable("loyalty_points_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  points: integer("points").notNull(), // Puede ser positivo (ganados) o negativo (gastados)
  reason: text("reason").notNull(), // 'purchase', 'reward', 'expiry', etc.
  orderId: integer("order_id").references(() => orders.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLoyaltyPointsHistorySchema = createInsertSchema(loyaltyPointsHistory).omit({
  id: true,
  createdAt: true,
});

export type LoyaltyPointsHistory = typeof loyaltyPointsHistory.$inferSelect;
export type InsertLoyaltyPointsHistory = z.infer<typeof insertLoyaltyPointsHistorySchema>;

// Staff/Professional model for team management
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  department: text("department").notNull(), // "farmacia" or "centro_medico"
  specialty: text("specialty"),
  description: text("description"),
  imageUrl: text("image_url"),
  email: text("email"),
  phone: text("phone"),
  languages: text("languages").array(),
  experience: text("experience"),
  education: text("education"),
  certifications: text("certifications").array(),
  socialLinks: text("social_links"), // JSON string for LinkedIn, etc.
  availability: text("availability"), // JSON string for schedule
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  status: text("status").notNull().default("active"), // active, inactive, archived
  isAvailable: boolean("is_available").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStaffSchema = createInsertSchema(staff).pick({
  name: true,
  role: true,
  department: true,
  specialty: true,
  description: true,
  imageUrl: true,
  email: true,
  phone: true,
  languages: true,
  experience: true,
  education: true,
  certifications: true,
  socialLinks: true,
  availability: true,
  rating: true,
  reviewCount: true,
  status: true,
  isAvailable: true,
  displayOrder: true,
});

export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Staff = typeof staff.$inferSelect;
