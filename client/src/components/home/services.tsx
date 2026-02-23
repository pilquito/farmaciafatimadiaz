import { motion } from "framer-motion";
import { PHARMACY_SERVICES, MEDICAL_SERVICES } from "@/data/constants";
import { Link } from "wouter";

export function Services() {
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <section id="servicios" className="py-16 bg-neutral-200">
      <div className="container mx-auto px-4">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Nuestros Servicios</h2>
          <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            Ofrecemos una amplia variedad de servicios profesionales para cuidar de su salud y bienestar desde todos los ángulos.
          </p>
        </motion.div>
        
        {/* Farmacia Services */}
        <div id="servicios-farmacia" className="mb-12">
          <h3 className="font-serif text-2xl font-bold mb-6 text-primary text-center">
            Servicios de Farmacia
          </h3>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {PHARMACY_SERVICES.map((service) => (
              <motion.div 
                key={service.id}
                className="service-card bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-xl"
                variants={item}
              >
                <div className="p-6">
                  <div className="icon-container w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4 transition duration-300">
                    <i className={`${service.icon} text-2xl`}></i>
                  </div>
                  <h4 className="font-serif text-xl font-bold mb-2">{service.title}</h4>
                  <p className="text-neutral-700">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Centro Médico Services */}
        <div id="servicios-medicos">
          <h3 className="font-serif text-2xl font-bold mb-6 text-primary text-center">
            Servicios del Centro Médico
          </h3>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {MEDICAL_SERVICES.map((service) => (
              <motion.div 
                key={service.id}
                className="service-card bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-xl"
                variants={item}
              >
                <div className="p-6">
                  <div className="icon-container w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4 transition duration-300">
                    <i className={`${service.icon} text-2xl`}></i>
                  </div>
                  <h4 className="font-serif text-xl font-bold mb-2">{service.title}</h4>
                  <p className="text-neutral-700">{service.description}</p>
                  {service.link && (
                    <div className="mt-4">
                      <Link to={service.link} className="text-primary hover:text-primary-dark font-medium inline-flex items-center">
                        Acceder al servicio
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
