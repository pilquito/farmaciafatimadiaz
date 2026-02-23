import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MEDICAL_SERVICES, CONSULTATIONS } from "@/data/constants";

export default function MedicalServicesPage() {
  return (
    <>
      <Helmet>
        <title>Servicios Médicos | Centro Médico Clodina</title>
        <meta name="description" content="Ofrecemos servicios médicos de calidad en Centro Médico Clodina: consultas médicas, especialidades, pruebas diagnósticas y más para el cuidado integral de su salud." />
      </Helmet>
      
      <PageHeader 
        title="Servicios Médicos" 
        description="En Centro Médico Clodina encontrará una amplia gama de servicios médicos para el cuidado integral de su salud"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Servicios", href: "/servicios" },
          { label: "Servicios Médicos", href: "/servicios/medicos", active: true }
        ]}
      />
      
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif font-bold text-neutral-800">Especialidades médicas</h2>
          <a 
            href="/servicios/especialidades" 
            className="text-primary hover:text-primary-dark font-medium flex items-center"
          >
            Ver todas <i className="fas fa-chevron-right ml-1 text-sm"></i>
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {MEDICAL_SERVICES.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden">
                <div className="aspect-video relative overflow-hidden bg-primary/10">
                  {service.imageUrl ? (
                    <img 
                      src={service.imageUrl} 
                      alt={service.title}
                      className="object-cover w-full h-full" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-primary">
                      <i className={`${service.icon || 'fas fa-stethoscope'} text-4xl`}></i>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-serif font-bold text-neutral-800 mb-3">{service.title}</h3>
                  <p className="text-neutral-600 mb-4">{service.description}</p>
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {service.tags && service.tags.map((tag, idx) => (
                        <span key={idx} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <h2 className="text-2xl font-serif font-bold text-neutral-800 mb-8">Consultas disponibles</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {CONSULTATIONS.map((consultation, index) => (
            <motion.div 
              key={consultation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-l-4 border-primary">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-serif font-bold text-neutral-800">{consultation.title}</h3>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      {consultation.duration} min
                    </span>
                  </div>
                  <p className="text-neutral-600 mb-4">{consultation.description}</p>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-neutral-200">
                    <span className="font-bold text-primary text-xl">{consultation.price}€</span>
                    <a 
                      href="/citas"
                      className="bg-primary hover:bg-primary/90 text-white text-sm font-medium py-2 px-4 rounded-md transition duration-300 inline-block"
                    >
                      Reservar cita
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="bg-neutral-100 rounded-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-serif font-bold text-neutral-800 mb-4">¿Necesita una cita médica?</h3>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Reserve su cita en línea para cualquiera de nuestras especialidades médicas o servicios de consulta.
            </p>
          </div>
          <div className="flex justify-center">
            <a 
              href="/citas"
              className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-8 rounded-md transition duration-300 inline-block"
            >
              Solicitar cita
            </a>
          </div>
        </div>
      </section>
    </>
  );
}