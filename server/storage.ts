import { db } from "./db";
import {
  users,
  testimonials,
  blogPosts,
  contactMessages,
  products,
  appointments,
  specialties,
  doctors,
  doctorSchedules,
  doctorExceptions,
  appointmentDurations,
  patients,
  insuranceCompanies,
  medicalVisits,
  medicalHistory,
  type User,
  type Testimonial,
  type BlogPost,
  type ContactMessage,
  type Product,
  type Appointment,
  type Specialty,
  type Doctor,
  type DoctorSchedule,
  type DoctorException,
  type AppointmentDuration,
  type Patient,
  type InsertUser,
  type InsertTestimonial,
  type InsertBlogPost,
  type InsertContactMessage,
  type InsertProduct,
  type InsertAppointment,
  type InsertSpecialty,
  type InsertDoctor,
  type InsertDoctorSchedule,
  type InsertDoctorException,
  type InsertAppointmentDuration,
  type InsertPatient,
  type InsuranceCompany,
  type InsertInsuranceCompany,
  type MedicalVisit,
  type InsertMedicalVisit,
  type MedicalHistory,
  type InsertMedicalHistory,
  staff,
  type Staff,
  type InsertStaff,
} from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

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
  
  // Doctor schedule operations
  getDoctorSchedules(doctorId: number): Promise<DoctorSchedule[]>;
  createDoctorSchedule(schedule: InsertDoctorSchedule): Promise<DoctorSchedule>;
  updateDoctorSchedule(id: number, scheduleData: Partial<DoctorSchedule>): Promise<DoctorSchedule | undefined>;
  deleteDoctorSchedule(id: number): Promise<boolean>;
  
  // Doctor exception operations
  getDoctorExceptions(doctorId: number, startDate?: string, endDate?: string): Promise<DoctorException[]>;
  createDoctorException(exception: InsertDoctorException): Promise<DoctorException>;
  updateDoctorException(id: number, exceptionData: Partial<DoctorException>): Promise<DoctorException | undefined>;
  deleteDoctorException(id: number): Promise<boolean>;
  
  // Appointment duration operations
  getAppointmentDurations(): Promise<AppointmentDuration[]>;
  getAppointmentDurationBySpecialty(specialtyId: number): Promise<AppointmentDuration | undefined>;
  createAppointmentDuration(duration: InsertAppointmentDuration): Promise<AppointmentDuration>;
  
  // Availability operations
  getDoctorAvailableSlots(doctorId: number, date: string, specialtyId?: number): Promise<string[]>;
  getAppointmentsByDoctorAndDate(doctorId: number, date: string): Promise<Appointment[]>;
  
  // Patient operations
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientByEmail(email: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;
  linkPatientToUser(patientId: number, userId: number): Promise<Patient | undefined>;

  // Insurance Company operations
  getInsuranceCompanies(): Promise<InsuranceCompany[]>;
  getInsuranceCompany(id: number): Promise<InsuranceCompany | undefined>;
  createInsuranceCompany(company: InsertInsuranceCompany): Promise<InsuranceCompany>;
  updateInsuranceCompany(id: number, companyData: Partial<InsuranceCompany>): Promise<InsuranceCompany | undefined>;
  deleteInsuranceCompany(id: number): Promise<boolean>;

  // Staff operations
  getStaff(): Promise<Staff[]>;
  getStaffByDepartment(department: string): Promise<Staff[]>;
  getStaffMember(id: number): Promise<Staff | undefined>;
  createStaffMember(staffData: InsertStaff): Promise<Staff>;
  updateStaffMember(id: number, staffData: Partial<Staff>): Promise<Staff | undefined>;
  deleteStaffMember(id: number): Promise<boolean>;
  archiveStaffMember(id: number): Promise<Staff | undefined>;
  getActiveStaff(): Promise<Staff[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async verifyUser(token: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isVerified: true, verificationToken: null })
      .where(eq(users.verificationToken, token))
      .returning();
    return user || undefined;
  }

  async updatePassword(id: number, newPassword: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ 
        password: newPassword, 
        resetPasswordToken: null,
        resetPasswordExpires: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async setResetPasswordToken(email: string, token: string): Promise<User | undefined> {
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // Token válido por 1 hora
    
    const [user] = await db
      .update(users)
      .set({ 
        resetPasswordToken: token,
        resetPasswordExpires: expires,
        updatedAt: new Date()
      })
      .where(eq(users.email, email))
      .returning();
    return user || undefined;
  }

  async getUserByResetPasswordToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetPasswordToken, token));
    
    // Verificar que el token no haya expirado
    if (user && user.resetPasswordExpires && user.resetPasswordExpires > new Date()) {
      return user;
    }
    return undefined;
  }

  async updateLastLogin(id: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserApproval(id: number, isApproved: boolean): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isApproved, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserRole(id: number, role: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Testimonial operations
  async getTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials).orderBy(desc(testimonials.date));
  }

  async getApprovedTestimonials(): Promise<Testimonial[]> {
    return await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.approved, true))
      .orderBy(desc(testimonials.date));
  }

  async getTestimonial(id: number): Promise<Testimonial | undefined> {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, id));
    return testimonial || undefined;
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db
      .insert(testimonials)
      .values({
        ...insertTestimonial,
        approved: false
      })
      .returning();
    return testimonial;
  }

  // Blog operations
  async getBlogPosts(): Promise<BlogPost[]> {
    return await db.select().from(blogPosts).orderBy(desc(blogPosts.publishDate));
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [blogPost] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return blogPost || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [blogPost] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return blogPost || undefined;
  }

  async createBlogPost(insertBlogPost: InsertBlogPost): Promise<BlogPost> {
    const [blogPost] = await db
      .insert(blogPosts)
      .values(insertBlogPost)
      .returning();
    return blogPost;
  }

  async updateBlogPost(id: number, blogPostData: Partial<BlogPost>): Promise<BlogPost | undefined> {
    const [updatedBlogPost] = await db
      .update(blogPosts)
      .set(blogPostData)
      .where(eq(blogPosts.id, id))
      .returning();
    return updatedBlogPost || undefined;
  }

  async deleteBlogPost(id: number): Promise<boolean> {
    const result = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Contact operations
  async getContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.date));
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [contactMessage] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return contactMessage || undefined;
  }

  async createContactMessage(insertContactMessage: InsertContactMessage): Promise<ContactMessage> {
    const [contactMessage] = await db
      .insert(contactMessages)
      .values({
        ...insertContactMessage,
        date: new Date(),
        processed: false,
        notes: null,
        reply: null
      })
      .returning();
    return contactMessage;
  }

  async updateContactMessageStatus(id: number, status: {
    processed?: boolean;
  }): Promise<ContactMessage | undefined> {
    const message = await this.getContactMessage(id);
    if (!message) {
      return undefined;
    }
    
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({ processed: status.processed })
      .where(eq(contactMessages.id, id))
      .returning();
    
    return updatedMessage;
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.dateAdded));
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.featured, true)).orderBy(desc(products.dateAdded));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category)).orderBy(desc(products.dateAdded));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        ...insertProduct,
        dateAdded: new Date()
      })
      .returning();
    return product;
  }

  // Appointment operations
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.createdAt));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }

  async getAppointmentsByUser(userId: number): Promise<Appointment[]> {
    const results = await db
      .select({
        id: appointments.id,
        userId: appointments.userId,
        patientId: appointments.patientId,
        name: appointments.name,
        email: appointments.email,
        phone: appointments.phone,
        date: appointments.date,
        time: appointments.time,
        reason: appointments.reason,
        insurance: appointments.insurance,
        notes: appointments.notes,
        status: appointments.status,
        createdAt: appointments.createdAt,
        specialtyId: appointments.specialtyId,
        doctorId: appointments.doctorId,
        doctorName: doctors.name
      })
      .from(appointments)
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(eq(appointments.userId, userId))
      .orderBy(desc(appointments.createdAt));
    
    return results as Appointment[];
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values({
        ...insertAppointment,
        status: "pendiente"
      })
      .returning();
    return appointment;
  }

  async updateAppointment(id: number, appointmentData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set(appointmentData)
      .where(eq(appointments.id, id))
      .returning();
    return appointment || undefined;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const [appointment] = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, id))
      .returning();
    return appointment || undefined;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db
      .delete(appointments)
      .where(eq(appointments.id, id));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Specialty operations
  async getSpecialties(): Promise<Specialty[]> {
    return await db.select().from(specialties).orderBy(desc(specialties.createdAt));
  }

  async getSpecialty(id: number): Promise<Specialty | undefined> {
    const [specialty] = await db.select().from(specialties).where(eq(specialties.id, id));
    return specialty || undefined;
  }

  async createSpecialty(insertSpecialty: InsertSpecialty): Promise<Specialty> {
    const [specialty] = await db
      .insert(specialties)
      .values({
        ...insertSpecialty,
        active: insertSpecialty.active ?? true,
        createdAt: new Date()
      })
      .returning();
    return specialty;
  }

  async updateSpecialty(id: number, specialtyData: Partial<Specialty>): Promise<Specialty | undefined> {
    const [updatedSpecialty] = await db
      .update(specialties)
      .set(specialtyData)
      .where(eq(specialties.id, id))
      .returning();
      
    return updatedSpecialty || undefined;
  }

  async deleteSpecialty(id: number): Promise<boolean> {
    const result = await db
      .delete(specialties)
      .where(eq(specialties.id, id));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Doctor operations
  async getDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors).orderBy(desc(doctors.createdAt));
  }

  async getDoctor(id: number): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor || undefined;
  }

  async getDoctorsBySpecialty(specialtyId: number): Promise<Doctor[]> {
    return await db.select().from(doctors).where(eq(doctors.specialtyId, specialtyId));
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db
      .insert(doctors)
      .values({
        ...insertDoctor,
        active: insertDoctor.active ?? true,
        createdAt: new Date()
      })
      .returning();
    return doctor;
  }

  async updateDoctor(id: number, doctorData: Partial<Doctor>): Promise<Doctor | undefined> {
    const [updatedDoctor] = await db
      .update(doctors)
      .set(doctorData)
      .where(eq(doctors.id, id))
      .returning();
      
    return updatedDoctor || undefined;
  }

  async deleteDoctor(id: number): Promise<boolean> {
    // En lugar de eliminar físicamente, marcamos como inactivo
    const result = await db
      .update(doctors)
      .set({ active: false })
      .where(eq(doctors.id, id));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async archiveDoctor(id: number): Promise<boolean> {
    const result = await db
      .update(doctors)
      .set({ active: false })
      .where(eq(doctors.id, id));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  async activateDoctor(id: number): Promise<boolean> {
    const result = await db
      .update(doctors)
      .set({ active: true })
      .where(eq(doctors.id, id));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Doctor schedule operations
  async getDoctorSchedules(doctorId: number): Promise<DoctorSchedule[]> {
    return await db
      .select()
      .from(doctorSchedules)
      .where(eq(doctorSchedules.doctorId, doctorId));
  }

  async createDoctorSchedule(schedule: InsertDoctorSchedule): Promise<DoctorSchedule> {
    const [newSchedule] = await db
      .insert(doctorSchedules)
      .values(schedule)
      .returning();
    return newSchedule;
  }

  async updateDoctorSchedule(id: number, scheduleData: Partial<DoctorSchedule>): Promise<DoctorSchedule | undefined> {
    const [updatedSchedule] = await db
      .update(doctorSchedules)
      .set(scheduleData)
      .where(eq(doctorSchedules.id, id))
      .returning();
    return updatedSchedule || undefined;
  }

  async deleteDoctorSchedule(id: number): Promise<boolean> {
    const result = await db
      .delete(doctorSchedules)
      .where(eq(doctorSchedules.id, id));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Doctor exception operations
  async getDoctorExceptions(doctorId: number, startDate?: string, endDate?: string): Promise<DoctorException[]> {
    if (startDate && endDate) {
      return await db
        .select()
        .from(doctorExceptions)
        .where(
          and(
            eq(doctorExceptions.doctorId, doctorId),
            gte(doctorExceptions.date, startDate),
            lte(doctorExceptions.date, endDate)
          )
        );
    }

    return await db
      .select()
      .from(doctorExceptions)
      .where(eq(doctorExceptions.doctorId, doctorId));
  }

  async createDoctorException(exception: InsertDoctorException): Promise<DoctorException> {
    const [newException] = await db
      .insert(doctorExceptions)
      .values(exception)
      .returning();
    return newException;
  }

  async updateDoctorException(id: number, exceptionData: Partial<DoctorException>): Promise<DoctorException | undefined> {
    const [updatedException] = await db
      .update(doctorExceptions)
      .set(exceptionData)
      .where(eq(doctorExceptions.id, id))
      .returning();
    return updatedException || undefined;
  }

  async deleteDoctorException(id: number): Promise<boolean> {
    const result = await db
      .delete(doctorExceptions)
      .where(eq(doctorExceptions.id, id));
    
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Appointment duration operations
  async getAppointmentDurations(): Promise<AppointmentDuration[]> {
    return await db.select().from(appointmentDurations);
  }

  async getAppointmentDurationBySpecialty(specialtyId: number): Promise<AppointmentDuration | undefined> {
    const [duration] = await db
      .select()
      .from(appointmentDurations)
      .where(eq(appointmentDurations.specialtyId, specialtyId));
    return duration || undefined;
  }

  async createAppointmentDuration(duration: InsertAppointmentDuration): Promise<AppointmentDuration> {
    const [newDuration] = await db
      .insert(appointmentDurations)
      .values(duration)
      .returning();
    return newDuration;
  }

  // Availability operations
  async getDoctorAvailableSlots(doctorId: number, date: string, specialtyId?: number): Promise<string[]> {
    // Obtener horario del doctor para el día de la semana
    const dayOfWeek = new Date(date).getDay();
    const schedules = await db
      .select()
      .from(doctorSchedules)
      .where(
        and(
          eq(doctorSchedules.doctorId, doctorId),
          eq(doctorSchedules.dayOfWeek, dayOfWeek),
          eq(doctorSchedules.isActive, true)
        )
      );

    if (schedules.length === 0) {
      return []; // No hay horario disponible
    }

    // Obtener excepciones para la fecha específica
    const exceptions = await db
      .select()
      .from(doctorExceptions)
      .where(
        and(
          eq(doctorExceptions.doctorId, doctorId),
          eq(doctorExceptions.date, date)
        )
      );

    // Obtener citas existentes para la fecha
    const existingAppointments = await this.getAppointmentsByDoctorAndDate(doctorId, date);

    // Obtener duración de la cita según la especialidad
    let appointmentDuration = 30; // Default
    if (specialtyId) {
      const duration = await this.getAppointmentDurationBySpecialty(specialtyId);
      if (duration) {
        appointmentDuration = duration.duration;
      }
    }

    // Generar slots disponibles
    const availableSlots: string[] = [];
    
    for (const schedule of schedules) {
      // Verificar si hay excepción que anule todo el día
      const dayException = exceptions.find(ex => !ex.startTime && !ex.startTime && !ex.isAvailable);
      if (dayException) {
        continue; // Skip this schedule
      }

      const startTime = this.parseTime(schedule.startTime);
      const endTime = this.parseTime(schedule.endTime);
      
      let currentTime = startTime;
      
      while (currentTime < endTime) {
        const timeSlot = this.formatTime(currentTime);
        
        // Verificar si el slot está ocupado por una cita existente
        const isOccupied = existingAppointments.some(apt => apt.time === timeSlot);
        
        // Verificar si hay excepción específica para esta hora
        const hasException = exceptions.some(ex => {
          if (!ex.startTime || !ex.endTime) return false;
          const exStart = this.parseTime(ex.startTime);
          const exEnd = this.parseTime(ex.endTime);
          return currentTime >= exStart && currentTime < exEnd && !ex.isAvailable;
        });
        
        if (!isOccupied && !hasException) {
          availableSlots.push(timeSlot);
        }
        
        currentTime += appointmentDuration;
      }
    }

    return availableSlots;
  }

  async getAppointmentsByDoctorAndDate(doctorId: number, date: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.date, date)
        )
      );
  }

  // Patient operations
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients).orderBy(desc(patients.createdAt));
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }

  async getPatientByEmail(email: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.email, email));
    return patient || undefined;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db
      .insert(patients)
      .values({
        ...insertPatient,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return patient;
  }

  async updatePatient(id: number, patientData: Partial<Patient>): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set({ ...patientData, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return patient || undefined;
  }

  async deletePatient(id: number): Promise<boolean> {
    const result = await db.delete(patients).where(eq(patients.id, id));
    return Array.isArray(result) ? result.length > 0 : Boolean(result);
  }

  async linkPatientToUser(patientId: number, userId: number): Promise<Patient | undefined> {
    const [patient] = await db
      .update(patients)
      .set({ userId, updatedAt: new Date() })
      .where(eq(patients.id, patientId))
      .returning();
    return patient || undefined;
  }

  // Insurance Company operations
  async getInsuranceCompanies(): Promise<InsuranceCompany[]> {
    return await db.select().from(insuranceCompanies).where(eq(insuranceCompanies.active, true)).orderBy(insuranceCompanies.name);
  }

  async getInsuranceCompany(id: number): Promise<InsuranceCompany | undefined> {
    const [company] = await db.select().from(insuranceCompanies).where(eq(insuranceCompanies.id, id));
    return company || undefined;
  }

  async createInsuranceCompany(insertCompany: InsertInsuranceCompany): Promise<InsuranceCompany> {
    const [company] = await db
      .insert(insuranceCompanies)
      .values({
        ...insertCompany,
        createdAt: new Date()
      })
      .returning();
    return company;
  }

  async updateInsuranceCompany(id: number, companyData: Partial<InsuranceCompany>): Promise<InsuranceCompany | undefined> {
    const [company] = await db
      .update(insuranceCompanies)
      .set(companyData)
      .where(eq(insuranceCompanies.id, id))
      .returning();
    return company || undefined;
  }

  async deleteInsuranceCompany(id: number): Promise<boolean> {
    const result = await db.delete(insuranceCompanies).where(eq(insuranceCompanies.id, id));
    return Array.isArray(result) ? result.length > 0 : Boolean(result);
  }

  // Medical visits operations
  async getMedicalVisits(): Promise<MedicalVisit[]> {
    return await db.select().from(medicalVisits).orderBy(desc(medicalVisits.visitDate));
  }

  async getMedicalVisitsByPatient(patientId: number): Promise<MedicalVisit[]> {
    const visits = await db
      .select({
        id: medicalVisits.id,
        patientId: medicalVisits.patientId,
        doctorId: medicalVisits.doctorId,
        appointmentId: medicalVisits.appointmentId,
        visitDate: medicalVisits.visitDate,
        visitType: medicalVisits.visitType,
        chiefComplaint: medicalVisits.chiefComplaint,
        symptoms: medicalVisits.symptoms,
        examination: medicalVisits.examination,
        diagnosis: medicalVisits.diagnosis,
        treatment: medicalVisits.treatment,
        medications: medicalVisits.medications,
        notes: medicalVisits.notes,
        nextVisitDate: medicalVisits.nextVisitDate,
        previousVisitId: medicalVisits.previousVisitId,
        status: medicalVisits.status,
        attachments: medicalVisits.attachments,
        createdAt: medicalVisits.createdAt,
        updatedAt: medicalVisits.updatedAt,
        doctorName: doctors.name
      })
      .from(medicalVisits)
      .leftJoin(doctors, eq(medicalVisits.doctorId, doctors.id))
      .where(eq(medicalVisits.patientId, patientId))
      .orderBy(desc(medicalVisits.visitDate));
    
    return visits as MedicalVisit[];
  }

  async getMedicalVisit(id: number): Promise<MedicalVisit | undefined> {
    const [visit] = await db.select().from(medicalVisits).where(eq(medicalVisits.id, id));
    return visit || undefined;
  }

  async createMedicalVisit(insertVisit: InsertMedicalVisit): Promise<MedicalVisit> {
    const [visit] = await db.insert(medicalVisits).values({
      ...insertVisit,
      updatedAt: new Date()
    }).returning();
    return visit;
  }

  async updateMedicalVisit(id: number, visitData: Partial<InsertMedicalVisit>): Promise<MedicalVisit | undefined> {
    const [visit] = await db
      .update(medicalVisits)
      .set({
        ...visitData,
        updatedAt: new Date()
      })
      .where(eq(medicalVisits.id, id))
      .returning();
    return visit || undefined;
  }

  async deleteMedicalVisit(id: number): Promise<boolean> {
    const result = await db.delete(medicalVisits).where(eq(medicalVisits.id, id));
    return Array.isArray(result) ? result.length > 0 : Boolean(result);
  }

  // Medical history operations
  async getMedicalHistory(patientId: number): Promise<MedicalHistory | undefined> {
    const [history] = await db.select().from(medicalHistory).where(eq(medicalHistory.patientId, patientId));
    return history || undefined;
  }

  async createMedicalHistory(insertHistory: InsertMedicalHistory): Promise<MedicalHistory> {
    const [history] = await db.insert(medicalHistory).values({
      ...insertHistory,
      updatedAt: new Date()
    }).returning();
    return history;
  }

  async updateMedicalHistory(patientId: number, historyData: Partial<InsertMedicalHistory>): Promise<MedicalHistory | undefined> {
    // First check if history exists for this patient
    const existing = await this.getMedicalHistory(patientId);
    
    if (existing) {
      // Update existing history
      const [history] = await db
        .update(medicalHistory)
        .set({
          ...historyData,
          updatedAt: new Date()
        })
        .where(eq(medicalHistory.patientId, patientId))
        .returning();
      return history || undefined;
    } else {
      // Create new history
      const [history] = await db.insert(medicalHistory).values({
        patientId,
        ...historyData,
        updatedAt: new Date()
      }).returning();
      return history;
    }
  }

  // Staff operations
  async getStaff(): Promise<Staff[]> {
    return await db.select().from(staff).orderBy(staff.displayOrder, staff.name);
  }

  async getStaffByDepartment(department: string): Promise<Staff[]> {
    return await db.select().from(staff)
      .where(and(eq(staff.department, department), eq(staff.status, 'active')))
      .orderBy(staff.displayOrder, staff.name);
  }

  async getStaffMember(id: number): Promise<Staff | undefined> {
    const [member] = await db.select().from(staff).where(eq(staff.id, id));
    return member || undefined;
  }

  async createStaffMember(staffData: InsertStaff): Promise<Staff> {
    const [member] = await db.insert(staff).values({
      ...staffData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();
    return member;
  }

  async updateStaffMember(id: number, staffData: Partial<Staff>): Promise<Staff | undefined> {
    const [member] = await db
      .update(staff)
      .set({ ...staffData, updatedAt: new Date() })
      .where(eq(staff.id, id))
      .returning();
    return member || undefined;
  }

  async deleteStaffMember(id: number): Promise<boolean> {
    const result = await db.delete(staff).where(eq(staff.id, id));
    return (result.rowCount || 0) > 0;
  }

  async archiveStaffMember(id: number): Promise<Staff | undefined> {
    const [member] = await db
      .update(staff)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(staff.id, id))
      .returning();
    return member || undefined;
  }

  async getActiveStaff(): Promise<Staff[]> {
    return await db.select().from(staff)
      .where(eq(staff.status, 'active'))
      .orderBy(staff.displayOrder, staff.name);
  }

  // Utility methods for time handling
  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}

export const storage = new DatabaseStorage();