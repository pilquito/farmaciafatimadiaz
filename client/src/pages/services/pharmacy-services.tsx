import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { PHARMACY_SERVICES } from "@/data/constants";

export default function PharmacyServicesPage() {
  return (
    <>
      <Helmet>
        <title>Asesoramiento Farmacéutico Especializado | Farmacia Fátima Díaz Guillén</title>
        <meta name="description" content="Asesoramiento farmacéutico profesional con farmacéuticos titulados. Seguimiento farmacoterapéutico, control de medicación, dermofarmacia y consultas sin cita previa." />
      </Helmet>
      
      <PageHeader 
        title="Asesoramiento Farmacéutico Profesional" 
        description="Nuestros farmacéuticos titulados le ofrecen asesoramiento especializado, seguimiento personalizado y soluciones de salud adaptadas a sus necesidades específicas"
        breadcrumbs={[
          { label: "Inicio", href: "/" },
          { label: "Servicios", href: "/servicios" },
          { label: "Asesoramiento Farmacéutico", href: "/servicios/farmacia", active: true }
        ]}
      />
      
      <section className="container mx-auto px-4 py-12">
        {/* Introduction Section */}
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-neutral-800 mb-6">
            Su Farmacéutico de Confianza
          </h2>
          <p className="text-lg text-neutral-600 mb-8">
            En Farmacia Fátima Díaz Guillén, nuestros farmacéuticos titulados están comprometidos con su salud y bienestar. 
            Ofrecemos asesoramiento especializado, seguimiento personalizado y soluciones de salud adaptadas a sus necesidades específicas.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="bg-primary/5 p-6 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fas fa-user-graduate text-2xl text-primary"></i>
              </div>
              <h3 className="font-bold text-neutral-800 mb-2">Farmacéuticos Titulados</h3>
              <p className="text-neutral-600 text-sm">Profesionales colegiados con formación continua</p>
            </div>
            <div className="bg-primary/5 p-6 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-2xl text-primary"></i>
              </div>
              <h3 className="font-bold text-neutral-800 mb-2">Atención Inmediata</h3>
              <p className="text-neutral-600 text-sm">Consulte sus dudas sin cita previa</p>
            </div>
            <div className="bg-primary/5 p-6 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <i className="fas fa-shield-alt text-2xl text-primary"></i>
              </div>
              <h3 className="font-bold text-neutral-800 mb-2">Confidencialidad Total</h3>
              <p className="text-neutral-600 text-sm">Atención personalizada y privada</p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {PHARMACY_SERVICES.map((service, index) => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                      <i className={`${service.icon || 'fas fa-prescription-bottle-medical'} text-xl`}></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-serif font-bold text-neutral-800 mb-2">{service.title}</h3>
                      <p className="text-neutral-600 mb-4">{service.description}</p>
                    </div>
                  </div>
                  
                  {service.details && (
                    <div className="bg-neutral-50 rounded-lg p-4">
                      <h4 className="font-semibold text-neutral-800 mb-3">¿Qué incluye este servicio?</h4>
                      <ul className="space-y-2">
                        {service.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600">
                            <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <i className="fas fa-check text-xs text-primary"></i>
                            </span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        {/* Why Choose Our Pharmaceutical Advisory */}
        <div className="mt-16 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-neutral-800 text-center mb-8">
              ¿Por qué elegir nuestro asesoramiento farmacéutico?
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                    <i className="fas fa-certificate text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800 mb-2">Experiencia Acreditada</h3>
                    <p className="text-neutral-600 text-sm">
                      Más de 20 años de experiencia en atención farmacéutica, con formación continua en las últimas novedades terapéuticas.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                    <i className="fas fa-user-check text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800 mb-2">Atención Personalizada</h3>
                    <p className="text-neutral-600 text-sm">
                      Cada consulta es única. Adaptamos nuestro asesoramiento a sus necesidades específicas, historial médico y estilo de vida.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                    <i className="fas fa-handshake text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800 mb-2">Coordinación Médica</h3>
                    <p className="text-neutral-600 text-sm">
                      Trabajamos en estrecha colaboración con su médico para optimizar sus tratamientos y evitar interacciones.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                    <i className="fas fa-chart-line text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800 mb-2">Seguimiento Continuo</h3>
                    <p className="text-neutral-600 text-sm">
                      No solo dispensamos medicamentos, sino que hacemos seguimiento de su evolución y ajustamos recomendaciones.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                    <i className="fas fa-database text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800 mb-2">Historial Farmacoterapéutico</h3>
                    <p className="text-neutral-600 text-sm">
                      Mantenemos un registro completo de sus medicamentos y tratamientos para brindar el mejor servicio.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                    <i className="fas fa-mobile-alt text-sm"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-800 mb-2">Disponibilidad</h3>
                    <p className="text-neutral-600 text-sm">
                      Estamos disponibles para resolver sus dudas urgentes y brindar asesoramiento cuando lo necesite.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-neutral-800 mb-4">
                Comience hoy mismo con su asesoramiento farmacéutico personalizado
              </h3>
              <p className="text-neutral-600 mb-6">
                Reserve una consulta con nuestros farmacéuticos especialistas y descubra cómo podemos ayudarle a optimizar sus tratamientos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-md transition duration-300">
                  Agendar Consulta
                </button>
                <button className="bg-white border border-primary text-primary hover:bg-primary/5 font-medium py-3 px-6 rounded-md transition duration-300">
                  Más Información
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-neutral-100 rounded-lg p-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/3 text-center md:text-left">
              <h3 className="text-2xl font-serif font-bold text-neutral-800 mb-4">¿Necesita más información?</h3>
              <p className="text-neutral-600 mb-6">
                Estamos a su disposición para resolver cualquier duda sobre nuestros servicios farmacéuticos.
              </p>
              <button 
                className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-md transition duration-300"
                onClick={() => {
                  const contactSection = document.getElementById('contacto');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Contactar
              </button>
            </div>
            <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <i className="fas fa-phone-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800">Teléfono</h4>
                    <p className="text-neutral-600">922 51 21 51</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800">Email</h4>
                    <p className="text-neutral-600">info@farmaciafatimadiaz.com</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800">Horario</h4>
                    <p className="text-neutral-600">Lun-Vie: 9:00-21:00</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-md shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-800">Dirección</h4>
                    <p className="text-neutral-600">CALLE NICARAGUA 2, 38500, Guimar (Tenerife)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}