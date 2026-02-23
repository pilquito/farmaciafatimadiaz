import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CONSULTATIONS } from "@/data/constants";

export function Consultation() {
  return (
    <section 
      id="centro-medico" 
      className="py-16 bg-[url('https://images.unsplash.com/photo-1579684288361-5c1a2955d0bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=600')] bg-cover bg-center bg-fixed"
    >
      <div className="bg-white/95 py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Consultas Médicas</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-neutral-700 max-w-2xl mx-auto">
              Nuestro equipo de profesionales médicos está a su disposición para atenderle en diversas especialidades.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CONSULTATIONS.map((consultation, index) => (
              <motion.div 
                key={consultation.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden transition duration-300 hover:shadow-xl border border-neutral-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="p-6">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4 mx-auto">
                    <i className={`${consultation.icon} text-2xl`}></i>
                  </div>
                  <h3 className="font-serif text-xl font-bold mb-4 text-center text-neutral-800">{consultation.title}</h3>
                  <ul className="space-y-3 mb-6">
                    {consultation.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <i className="fas fa-check-circle text-primary mt-1 mr-3"></i>
                        <span className="text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-center">
                    <a href="#consulta">
                      <Button className="px-6 py-2 bg-primary text-white hover:bg-primary-dark">
                        Pedir cita
                      </Button>
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button variant="secondary" className="px-6 py-3 bg-neutral-800 text-white hover:bg-neutral-700 inline-flex items-center">
              <span>Ver todas las especialidades</span>
              <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
