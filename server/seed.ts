import { db } from "./db";
import { blogPosts, testimonials, products } from "@shared/schema";

async function seed() {
  console.log("Iniciando el proceso de inicialización de datos...");
  
  // Verificar si ya existen datos
  const existingPosts = await db.select({ count: { value: blogPosts.id } }).from(blogPosts);
  const postCount = existingPosts[0]?.count?.value || 0;
  
  const existingTestimonials = await db.select({ count: { value: testimonials.id } }).from(testimonials);
  const testimonialCount = existingTestimonials[0]?.count?.value || 0;
  
  // Solo insertar datos si no hay registros existentes
  if (postCount === 0) {
    console.log("Insertando publicaciones de blog de ejemplo...");
    
    await db.insert(blogPosts).values([
      {
        title: "Cómo prepararse para su consulta médica",
        slug: "como-prepararse-para-su-consulta-medica",
        category: "Salud general",
        content: "Consejos prácticos para aprovechar al máximo su cita con el médico y asegurar una comunicación efectiva. Preparar una lista de preguntas, llevar un registro de síntomas y ser honesto con su médico son clave para una consulta productiva.",
        excerpt: "Consejos prácticos para aprovechar al máximo su cita con el médico y asegurar una comunicación efectiva.",
        imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=300",
        publishDate: new Date()
      },
      {
        title: "Vitaminas esenciales para reforzar el sistema inmune",
        slug: "vitaminas-esenciales-para-reforzar-el-sistema-inmune",
        category: "Nutrición",
        content: "Descubra qué vitaminas y minerales son fundamentales para fortalecer sus defensas naturales. La vitamina C, D, zinc y selenio juegan un papel crucial en mantener un sistema inmunológico saludable y fuerte.",
        excerpt: "Descubra qué vitaminas y minerales son fundamentales para fortalecer sus defensas naturales.",
        imageUrl: "https://pixabay.com/get/g38d7104c847af731f667324fa972943e44404157d4906037c5d6f5f96b332b0f634c1f732ce566eb1d70f17e478247bd032121a5b91b6ead770778061dab1d28_1280.jpg",
        publishDate: new Date()
      },
      {
        title: "Rutina de cuidado facial para pieles sensibles",
        slug: "rutina-de-cuidado-facial-para-pieles-sensibles",
        category: "Dermatología",
        content: "Guía completa para el cuidado diario de pieles sensibles, recomendada por nuestros dermatólogos. Aprenda qué ingredientes evitar y cuáles son beneficiosos para su tipo de piel específico.",
        excerpt: "Guía completa para el cuidado diario de pieles sensibles, recomendada por nuestros dermatólogos.",
        imageUrl: "https://images.unsplash.com/photo-1612817288484-6f916006741a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=300",
        publishDate: new Date()
      }
    ]);
    
    console.log("Publicaciones de blog insertadas correctamente.");
  } else {
    console.log(`Ya existen ${postCount} publicaciones de blog en la base de datos. Omitiendo inserción.`);
  }
  
  if (testimonialCount === 0) {
    console.log("Insertando testimonios de ejemplo...");
    
    await db.insert(testimonials).values([
      {
        name: "Carmen García",
        role: "Cliente habitual",
        content: "El servicio es excelente. Los farmacéuticos siempre están dispuestos a resolver mis dudas y ofrecerme asesoramiento personalizado.",
        rating: 5,
        date: new Date(),
        approved: true
      },
      {
        name: "Juan Martínez",
        role: "Paciente del Centro Médico",
        content: "La atención en el Centro Médico Clodina es inmejorable. Los médicos son profesionales y cercanos, explicando todo con claridad.",
        rating: 4,
        date: new Date(),
        approved: true
      },
      {
        name: "Elena Rodríguez",
        role: "Cliente ocasional",
        content: "Encontré en su farmacia productos específicos que no había encontrado en otros lugares. El personal fue muy amable y me ayudó a elegir.",
        rating: 4,
        date: new Date(),
        approved: true
      }
    ]);
    
    console.log("Testimonios insertados correctamente.");
  } else {
    console.log(`Ya existen ${testimonialCount} testimonios en la base de datos. Omitiendo inserción.`);
  }
  
  // DESHABILITADO: Inserción automática de citas de ejemplo
  // Las citas ahora usan specialtyId y doctorId (números) en lugar de speciality y doctor (texto)
  console.log("Inserción automática de citas de ejemplo deshabilitada.");
  
  // Verificar si ya existen productos
  const existingProducts = await db.select({ count: { value: products.id } }).from(products);
  const productCount = existingProducts[0]?.count?.value || 0;
  
  if (productCount === 0) {
    console.log("Insertando productos de ejemplo...");
    
    await db.insert(products).values([
      {
        name: "Vitaminas Complex",
        category: "Suplementos",
        description: "Complejo multivitamínico para fortalecer el sistema inmune y mantener una buena salud general.",
        price: "12.99",
        imageUrl: "https://images.unsplash.com/photo-1577344718665-3e7c0c1ecf6b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        discount: 0,
        inStock: true,
        featured: true
      },
      {
        name: "Termómetro Digital",
        category: "Equipos",
        description: "Termómetro digital de alta precisión con resultados en 10 segundos. Ideal para toda la familia.",
        price: "8.50",
        imageUrl: "https://images.unsplash.com/photo-1584362917165-526a968579e8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        discount: 10,
        inStock: true,
        featured: true
      },
      {
        name: "Crema Hidratante Facial",
        category: "Dermatología",
        description: "Hidratación profunda para todo tipo de piel. Fórmula no grasa con protección UV.",
        price: "15.99",
        imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        discount: 15,
        inStock: true,
        featured: true
      },
      {
        name: "Analgésico Natural",
        category: "Medicamentos",
        description: "Analgésico de origen natural para aliviar dolores leves y moderados sin efectos secundarios.",
        price: "7.25",
        imageUrl: "https://images.unsplash.com/photo-1550572017-4fcdbb59ad67?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        discount: 0,
        inStock: true,
        featured: true
      },
      {
        name: "Tensiómetro Automático",
        category: "Equipos",
        description: "Monitor de presión arterial con memoria para 120 mediciones. Fácil de usar y transportar.",
        price: "39.99",
        imageUrl: "https://images.unsplash.com/photo-1612670940073-8987f43b99ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        discount: 20,
        inStock: true,
        featured: true
      },
      {
        name: "Probióticos Digestivos",
        category: "Suplementos",
        description: "Fórmula con 10 mil millones de bacterias beneficiosas para mejorar la salud intestinal.",
        price: "19.50",
        imageUrl: "https://images.unsplash.com/photo-1596563950739-5845fba70f87?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        discount: 5,
        inStock: true,
        featured: true
      }
    ]);
    
    console.log("Productos insertados correctamente.");
  } else {
    console.log(`Ya existen ${productCount} productos en la base de datos. Omitiendo inserción.`);
  }
  
  console.log("Proceso de inicialización de datos completado.");
}

// Exportar la función seed para poder utilizarla desde otros archivos
export { seed };