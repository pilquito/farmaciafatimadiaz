// Pharmacy services
export const PHARMACY_SERVICES = [
  {
    id: "asesoramiento-farmaceutico",
    title: "Asesoramiento Farmacéutico Especializado",
    description: "Nuestros farmacéuticos titulados le ofrecen asesoramiento personalizado sobre medicamentos, interacciones, efectos secundarios y uso correcto de tratamientos. Consulte todas sus dudas sobre medicación sin cita previa.",
    icon: "fas fa-user-md",
    details: [
      "Revisión de medicación personalizada",
      "Información sobre interacciones medicamentosas",
      "Asesoramiento en automedicación responsable",
      "Resolución de dudas sobre efectos secundarios",
      "Optimización de tratamientos crónicos"
    ]
  },
  {
    id: "dispensacion-especializada",
    title: "Dispensación de Medicamentos Especializada",
    description: "Dispensación responsable con información detallada sobre posología, administración y conservación. Verificamos recetas, alertamos sobre contraindicaciones y garantizamos la seguridad en cada medicamento.",
    icon: "fas fa-pills",
    details: [
      "Verificación y validación de recetas médicas",
      "Información detallada sobre cada medicamento",
      "Control de adherencia al tratamiento",
      "Sistemas personalizados de dosificación",
      "Alertas de reposición de medicación"
    ]
  },
  {
    id: "seguimiento-farmacoterapeutico",
    title: "Seguimiento Farmacoterapéutico Integral",
    description: "Servicio especializado de seguimiento continuo de sus tratamientos para optimizar resultados terapéuticos, detectar problemas relacionados con medicamentos y mejorar su calidad de vida.",
    icon: "fas fa-file-prescription",
    details: [
      "Evaluación continua de la efectividad",
      "Detección precoz de problemas con medicamentos",
      "Coordinación con su médico tratante",
      "Historial farmacoterapéutico personalizado",
      "Recomendaciones de mejora en el tratamiento"
    ]
  },
  {
    id: "control-parametros",
    title: "Control y Monitorización de Parámetros",
    description: "Medición y control regular de parámetros de salud como tensión arterial, glucosa, colesterol, peso y composición corporal. Interpretación de resultados y asesoramiento preventivo.",
    icon: "fas fa-heartbeat",
    details: [
      "Medición de tensión arterial",
      "Control de glucemia capilar",
      "Análisis de colesterol y triglicéridos",
      "Composición corporal y peso",
      "Interpretación y seguimiento de resultados"
    ]
  },
  {
    id: "dermofarmacia",
    title: "Dermofarmacia y Cuidado de la Piel",
    description: "Asesoramiento especializado en productos dermocosméticos, tratamientos para problemas cutáneos, protección solar y rutinas de cuidado facial y corporal personalizadas según su tipo de piel.",
    icon: "fas fa-spa",
    details: [
      "Análisis personalizado del tipo de piel",
      "Recomendaciones de rutinas de cuidado",
      "Tratamientos para acné, rosácea y dermatitis",
      "Protección solar especializada",
      "Productos antienvejecimiento"
    ]
  },
  {
    id: "nutricion-dietetica",
    title: "Nutrición y Suplementación",
    description: "Asesoramiento nutricional profesional, recomendación de suplementos vitamínicos, productos dietéticos especiales y planes nutricionales adaptados a sus necesidades específicas de salud.",
    icon: "fas fa-apple-alt",
    details: [
      "Evaluación nutricional personalizada",
      "Recomendación de suplementos vitamínicos",
      "Productos para intolerancias alimentarias",
      "Nutrición deportiva especializada",
      "Planes dietéticos terapéuticos"
    ]
  },
  {
    id: "homeopatia-fitoterapia",
    title: "Homeopatía y Fitoterapia",
    description: "Amplio catálogo de medicamentos homeopáticos y productos fitoterapéuticos. Asesoramiento especializado en medicina natural, plantas medicinales y tratamientos alternativos complementarios.",
    icon: "fas fa-leaf",
    details: [
      "Medicamentos homeopáticos personalizados",
      "Plantas medicinales y extractos naturales",
      "Tratamientos alternativos complementarios",
      "Asesoramiento en medicina integrativa",
      "Productos ecológicos certificados"
    ]
  },
  {
    id: "ortopedia-ayudas-tecnicas",
    title: "Ortopedia y Ayudas Técnicas",
    description: "Productos ortopédicos profesionales, ayudas técnicas para movilidad, adaptación de productos ortopédicos y asesoramiento especializado para mejorar su calidad de vida y autonomía.",
    icon: "fas fa-wheelchair",
    details: [
      "Productos ortopédicos a medida",
      "Ayudas técnicas para movilidad",
      "Adaptación y ajuste personalizado",
      "Rehabilitación y fisioterapia",
      "Productos para cuidadores"
    ]
  }
];

// Medical center services
export const MEDICAL_SERVICES = [
  {
    id: "consultas-virtuales",
    title: "Consultas Virtuales",
    description: "Atención médica en línea con especialistas a través de chat o videollamada desde cualquier lugar.",
    icon: "fas fa-video",
    link: "/consultas-virtuales"
  },
  {
    id: "consultas",
    title: "Consultas Médicas",
    description: "Consultas con médicos especialistas en diferentes áreas de la medicina.",
    icon: "fas fa-user-md"
  },
  {
    id: "analisis",
    title: "Análisis Clínicos",
    description: "Realizamos análisis de sangre, orina y otros fluidos para diagnóstico médico.",
    icon: "fas fa-microscope"
  },
  {
    id: "fisioterapia",
    title: "Fisioterapia",
    description: "Tratamientos de fisioterapia para lesiones, dolor crónico y rehabilitación.",
    icon: "fas fa-procedures"
  },
  {
    id: "pediatria",
    title: "Pediatría",
    description: "Consulta especializada para el cuidado y tratamiento de niños y adolescentes.",
    icon: "fas fa-baby"
  },
  {
    id: "cardiologia",
    title: "Cardiología",
    description: "Diagnóstico y tratamiento de enfermedades relacionadas con el corazón y sistema circulatorio.",
    icon: "fas fa-heart"
  },
  {
    id: "dermatologia",
    title: "Dermatología",
    description: "Tratamiento de afecciones de la piel, cabello y uñas por especialistas.",
    icon: "fas fa-allergies"
  }
];

// Consultations specialties
export const CONSULTATIONS = [
  {
    id: "medicina-general",
    title: "Medicina General",
    icon: "fas fa-heart",
    features: [
      "Consulta médica general",
      "Seguimiento de patologías crónicas",
      "Certificados médicos"
    ]
  },
  {
    id: "cardiologia",
    title: "Cardiología",
    icon: "fas fa-heartbeat",
    features: [
      "Consulta de cardiología",
      "Electrocardiogramas",
      "Control de hipertensión"
    ]
  },
  {
    id: "neurologia",
    title: "Neurología",
    icon: "fas fa-brain",
    features: [
      "Consulta neurológica",
      "Evaluación de trastornos neurológicos",
      "Diagnóstico y tratamiento"
    ]
  }
];

// Product categories
export const PRODUCT_CATEGORIES = [
  {
    id: "medicamentos",
    name: "Medicamentos",
    description: "Encuentra medicamentos, vitaminas y suplementos para mejorar tu salud",
    icon: "fas fa-pills"
  },
  {
    id: "cosmetica",
    name: "Cosmética",
    description: "Productos de belleza y cuidado personal de las mejores marcas",
    icon: "fas fa-spa"
  },
  {
    id: "higiene",
    name: "Higiene",
    description: "Todo lo necesario para tu higiene personal y bucal diaria",
    icon: "fas fa-pump-soap"
  },
  {
    id: "infantil",
    name: "Infantil",
    description: "Productos especializados para el cuidado de los más pequeños",
    icon: "fas fa-baby"
  },
  {
    id: "ortopedia",
    name: "Ortopedia",
    description: "Artículos ortopédicos para mejorar tu calidad de vida",
    icon: "fas fa-wheelchair"
  },
  {
    id: "herbolario",
    name: "Herbolario",
    description: "Remedios naturales y productos a base de plantas medicinales",
    icon: "fas fa-leaf"
  }
];

// Mock products for demo purposes
export const PRODUCTS = [
  {
    id: 1,
    name: "Vitaminas y Suplementos",
    description: "Amplia gama de vitaminas y suplementos para reforzar su sistema inmunológico. Contiene vitamina C, D, zinc y otros minerales esenciales para fortalecer sus defensas naturales.",
    price: "19.95",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=300",
    category: "medicamentos",
    discount: 15,
    inStock: true,
    featured: true,
    dateAdded: new Date("2023-04-15")
  },
  {
    id: 2,
    name: "Crema Hidratante Facial",
    description: "Productos de dermocosmética de las mejores marcas para el cuidado de su piel. Hidratación intensiva para todo tipo de piel, con ingredientes naturales y sin parabenos.",
    price: "24.50",
    imageUrl: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    category: "cosmetica",
    discount: null,
    inStock: true,
    featured: true,
    dateAdded: new Date("2023-05-10")
  },
  {
    id: 3,
    name: "Bastón Ortopédico Ajustable",
    description: "Amplio catálogo de productos ortopédicos para mejorar su calidad de vida. Bastón ajustable en altura, con empuñadura ergonómica y base antideslizante para mayor seguridad.",
    price: "35.99",
    imageUrl: "https://images.unsplash.com/photo-1587556930799-8dca6fad6d61?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    category: "ortopedia",
    discount: 10,
    inStock: true,
    featured: false,
    dateAdded: new Date("2023-03-22")
  },
  {
    id: 4,
    name: "Kit Dental Completo",
    description: "Todo lo necesario para mantener una correcta higiene y salud bucal. Incluye cepillo de dientes, pasta dental, hilo dental y enjuague bucal con protección antibacteriana.",
    price: "12.75",
    imageUrl: "https://images.unsplash.com/photo-1559589167-c9220c5e92cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    category: "higiene",
    discount: 20,
    inStock: true,
    featured: true,
    dateAdded: new Date("2023-06-05")
  },
  {
    id: 5,
    name: "Pañales Ecológicos Talla 2",
    description: "Productos de cuidado e higiene para los más pequeños de la casa. Pañales ecológicos y biodegradables, hipoalergénicos y con alta capacidad de absorción.",
    price: "18.50",
    imageUrl: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    category: "infantil",
    discount: null,
    inStock: true,
    featured: false,
    dateAdded: new Date("2023-04-28")
  },
  {
    id: 6,
    name: "Protector Solar SPF 50+",
    description: "Proteja su piel de los rayos solares con nuestros productos especializados. Resistente al agua, con protección UVA/UVB y enriquecido con vitamina E y aloe vera.",
    price: "22.95",
    imageUrl: "https://images.unsplash.com/photo-1532413992378-f169ac26fff0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    category: "cosmetica",
    discount: 15,
    inStock: true,
    featured: true,
    dateAdded: new Date("2023-06-10")
  },
  {
    id: 7,
    name: "Té Verde Orgánico",
    description: "Remedios naturales y productos a base de hierbas para el bienestar. Té verde orgánico con propiedades antioxidantes, ideal para mejorar el metabolismo y la salud cardiovascular.",
    price: "9.99",
    imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    category: "herbolario",
    discount: null,
    inStock: true,
    featured: false,
    dateAdded: new Date("2023-05-15")
  },
  {
    id: 8,
    name: "Jabón Infantil Natural",
    description: "Productos específicos para la higiene y cuidado de la piel sensible de los niños. Elaborado con ingredientes 100% naturales, sin perfumes ni colorantes artificiales.",
    price: "8.50",
    imageUrl: "https://images.unsplash.com/photo-1607006344380-b6775a0824ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    category: "infantil",
    discount: 5,
    inStock: true,
    featured: false,
    dateAdded: new Date("2023-05-02")
  },
  {
    id: 9,
    name: "Tensiómetro Digital",
    description: "Dispositivo médico preciso para medir la presión arterial en casa. Fácil de usar, con pantalla LCD de gran tamaño y memoria para múltiples usuarios.",
    price: "45.00",
    imageUrl: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    category: "medicamentos",
    discount: null,
    inStock: false,
    featured: false,
    dateAdded: new Date("2023-03-10")
  },
  {
    id: 10,
    name: "Mascarilla Facial Hidratante",
    description: "Mascarilla facial hidratante con ácido hialurónico y colágeno para una piel radiante y rejuvenecida. Uso semanal para mejores resultados.",
    price: "15.75",
    imageUrl: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    category: "cosmetica",
    discount: 25,
    inStock: true,
    featured: true,
    dateAdded: new Date("2023-06-18")
  },
  {
    id: 11,
    name: "Termómetro Digital Infrarrojo",
    description: "Termómetro digital infrarrojo sin contacto, con medición rápida y precisa de la temperatura corporal. Ideal para uso familiar.",
    price: "29.99",
    imageUrl: "https://images.unsplash.com/photo-1623160850503-a2ab2eeff9c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    category: "medicamentos",
    discount: null,
    inStock: true,
    featured: false,
    dateAdded: new Date("2023-04-05")
  },
  {
    id: 12,
    name: "Champú Anticaspa",
    description: "Champú especializado para combatir la caspa y el picor del cuero cabelludo. Con ingredientes naturales que respetan el equilibrio del cabello.",
    price: "11.25",
    imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
    category: "higiene",
    discount: 10,
    inStock: true,
    featured: false,
    dateAdded: new Date("2023-05-25")
  }
];

// Team members
import doctora024 from "@/assets/024.jpg";
import doctor031 from "@/assets/031.jpg";
import doctora462687208 from "@/assets/462687208_4013054835591331_2734038148353580505_n.png";

export const TEAM_MEMBERS = [
  {
    id: "farmaceutico-1",
    name: "Lcda. M. Fátima Díaz Guillén",
    role: "Farmacéutica Titular",
    description: "Especialista en atención farmacéutica y seguimiento farmacoterapéutico con más de 15 años de experiencia.",
    imageUrl: doctora024
  },
  {
    id: "medico-1",
    name: "Dra. Clodina Sánchez",
    role: "Médico General - Directora Centro Médico",
    description: "Especialista en medicina familiar con amplia experiencia en el tratamiento de patologías crónicas.",
    imageUrl: doctora462687208
  },
  {
    id: "farmaceutico-2",
    name: "Dr. Esteban Martínez",
    role: "Farmacéutico Adjunto",
    description: "Experto en dermofarmacia y productos de parafarmacia, siempre dispuesto a ofrecerle el mejor consejo.",
    imageUrl: doctor031
  }
];
