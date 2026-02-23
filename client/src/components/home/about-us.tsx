import { motion } from "framer-motion";
import clodinaExterior from "@assets/IMG-20250711-WA0041_1753106938694.jpg";

export function AboutUs() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <section id="quienes-somos" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Quiénes Somos</h2>
          <div className="w-20 h-1 bg-primary mx-auto"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img 
                src="/assets/IMG-20250711-WA0039_1753098657968.jpg" 
                alt="Farmacia Fátima Díaz Guillén - Exterior" 
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-4">
                <img 
                  src="/assets/logo_farmacia_horizontal.png" 
                  alt="Farmacia Fátima Díaz Guillén" 
                  className="h-16 mx-auto"
                />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <h3 className="font-serif text-2xl font-bold mb-4 text-primary">Farmacia Fátima Díaz Guillén</h3>
            <p className="text-neutral-700 mb-4">
              En Farmacia Fátima Díaz Guillén, somos mucho más que una farmacia; somos un proyecto de vida que nació en 1999 de la mano de María Fátima Díaz Guillén. Desde nuestros inicios, nuestro sueño ha sido convertirnos en un pilar de salud y bienestar para nuestra comunidad, siempre con la cercanía, la empatía y una atención al cliente excepcional como estandarte.
            </p>
            <p className="text-neutral-700 mb-4">
              Con más de 20 años de experiencia, hemos tenido el privilegio de acompañarte y verte crecer. Cada día, nos esforzamos por construir relaciones basadas en la confianza y el entendimiento mutuo, porque sabemos que detrás de cada consulta hay una persona con necesidades únicas y, a menudo, preocupaciones.
            </p>
            <p className="text-neutral-700 mb-6">
              Aquí encontrarás no solo una amplia gama de productos farmacéuticos, cosméticos y de parafarmacia, sino también un equipo de profesionales que te escucha, te entiende y te asesora con el corazón. Para nosotros, tu salud y la de tu familia son lo más importante, y por eso te ofrecemos:
            </p>
            
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3 mt-1 flex-shrink-0">
                  <i className="fas fa-check text-sm"></i>
                </span>
                <div>
                  <strong className="text-neutral-800">Atención farmacéutica personalizada:</strong>
                  <span className="text-neutral-700"> nos tomamos el tiempo para conocerte y ofrecerte soluciones a medida, adaptadas a tu estilo de vida y tus necesidades específicas.</span>
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3 mt-1 flex-shrink-0">
                  <i className="fas fa-check text-sm"></i>
                </span>
                <div>
                  <strong className="text-neutral-800">Seguimiento farmacoterapéutico:</strong>
                  <span className="text-neutral-700"> te acompañamos en todo tu proceso de salud, asegurándonos de que tus tratamientos sean efectivos y seguros, y resolviendo todas tus dudas.</span>
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3 mt-1 flex-shrink-0">
                  <i className="fas fa-check text-sm"></i>
                </span>
                <div>
                  <strong className="text-neutral-800">Productos de calidad garantizada:</strong>
                  <span className="text-neutral-700"> seleccionamos cuidadosamente cada producto para ofrecerte solo lo mejor, siempre con la garantía y el respaldo que mereces.</span>
                </div>
              </li>
            </ul>
            
            <p className="text-neutral-700 mb-4">
              Porque en Farmacia Fátima Díaz Guillén, tu bienestar es nuestra razón de ser. Estamos aquí para cuidarte, asesorarte y, sobre todo, para escucharte con la calidez y cercanía que nos caracterizan desde el primer día.
            </p>
            
            <p className="text-primary font-semibold text-lg">
              ¡Te esperamos!
            </p>
          </motion.div>
        </div>
        
        <div className="h-0.5 w-full bg-neutral-300 my-16"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="order-2 md:order-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <h3 className="font-serif text-2xl font-bold mb-4 text-primary">Centro Médico Clodina</h3>
            <p className="text-neutral-700 mb-4">
              Nuestro centro médico proporciona servicios de atención sanitaria integral con un equipo multidisciplinar de profesionales comprometidos con su salud.
            </p>
            <p className="text-neutral-700 mb-6">
              Contamos con instalaciones modernas y tecnología avanzada para ofrecerle un diagnóstico preciso y un tratamiento efectivo.
            </p>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                  <i className="fas fa-check text-sm"></i>
                </span>
                <span>Consultas médicas especializadas</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                  <i className="fas fa-check text-sm"></i>
                </span>
                <span>Pruebas diagnósticas avanzadas</span>
              </li>
              <li className="flex items-center">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-3">
                  <i className="fas fa-check text-sm"></i>
                </span>
                <span>Seguimiento personalizado del paciente</span>
              </li>
            </ul>
          </motion.div>
          
          <motion.div 
            className="order-1 md:order-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
          >
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img 
                src={clodinaExterior}
                alt="Centro Médico Clodina - Exterior del edificio" 
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-4">
                <img 
                  src="/assets/logo_clodina_horizontal.png" 
                  alt="Centro Médico Clodina" 
                  className="h-16 mx-auto"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
