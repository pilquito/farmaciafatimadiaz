import { useState } from "react";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PHARMACY_SERVICES, MEDICAL_SERVICES } from "@/data/constants";

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
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
  
  const renderServiceDetail = (service: any) => (
    <motion.div 
      className="bg-white rounded-lg shadow-lg p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <button 
        onClick={() => setSelectedService(null)}
        className="mb-6 text-primary hover:underline flex items-center"
      >
        <i className="fas fa-arrow-left mr-2"></i>
        <span>Volver a todos los servicios</span>
      </button>
      
      <div className="flex items-center mb-6">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mr-4">
          <i className={`${service.icon} text-2xl`}></i>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-neutral-800">{service.title}</h2>
      </div>
      
      <p className="text-neutral-700 mb-6">{service.description}</p>
      
      {/* Expanded description for the service */}
      <div className="prose max-w-none">
        <h3>¿En qué consiste este servicio?</h3>
        <p>
          Nuestro servicio de {service.title.toLowerCase()} está diseñado para proporcionar a nuestros clientes la mejor atención 
          y asesoramiento profesional posible en esta área. Contamos con personal altamente cualificado y tecnología de última generación
          para garantizar resultados óptimos.
        </p>
        
        <h3>Beneficios</h3>
        <ul>
          <li>Atención personalizada por profesionales especializados</li>
          <li>Seguimiento continuo de su progreso y resultados</li>
          <li>Uso de técnicas y productos de la más alta calidad</li>
          <li>Asesoramiento integral adaptado a sus necesidades específicas</li>
        </ul>
        
        <h3>¿Cómo solicitar este servicio?</h3>
        <p>
          Puede solicitar este servicio directamente en nuestra farmacia o centro médico, o si lo prefiere, 
          puede utilizar nuestro formulario de contacto para programar una cita o consulta. Nuestro equipo estará 
          encantado de atenderle y resolver cualquier duda que pueda tener.
        </p>
      </div>
      
      <div className="mt-8">
        <a href="/contacto">
          <Button className="bg-primary text-white hover:bg-primary-dark">
            Solicitar información
          </Button>
        </a>
      </div>
    </motion.div>
  );
  
  const renderServiceGrid = (services: any[]) => (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {services.map((service) => (
        <motion.div 
          key={service.id}
          className="service-card bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-xl cursor-pointer"
          variants={item}
          onClick={() => setSelectedService(service.id)}
        >
          <div className="p-6">
            <div className="icon-container w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4 transition duration-300">
              <i className={`${service.icon} text-2xl`}></i>
            </div>
            <h3 className="font-serif text-xl font-bold mb-2">{service.title}</h3>
            <p className="text-neutral-700 mb-4">{service.description}</p>
            <Button variant="link" className="text-primary p-0 h-auto">
              Ver más detalles
              <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
  
  // Find the selected service from either service array
  const selectedPharmacyService = PHARMACY_SERVICES.find(service => service.id === selectedService);
  const selectedMedicalService = MEDICAL_SERVICES.find(service => service.id === selectedService);
  const currentSelectedService = selectedPharmacyService || selectedMedicalService;
  
  return (
    <>
      <Helmet>
        <title>Servicios | Farmacia Fátima Díaz Guillén & Centro Médico Clodina</title>
        <meta name="description" content="Descubra nuestra amplia gama de servicios farmacéuticos y médicos para el cuidado integral de su salud y bienestar." />
      </Helmet>
      
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-neutral-800">Nuestros Servicios</h1>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-neutral-700 max-w-2xl mx-auto">
              Ofrecemos una amplia variedad de servicios profesionales para cuidar de su salud y bienestar desde todos los ángulos, 
              tanto en nuestra farmacia como en nuestro centro médico.
            </p>
          </motion.div>
          
          {currentSelectedService ? (
            renderServiceDetail(currentSelectedService)
          ) : (
            <Tabs defaultValue="farmacia" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                <TabsTrigger value="farmacia" className="text-base">Farmacia</TabsTrigger>
                <TabsTrigger value="centro-medico" className="text-base">Centro Médico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="farmacia" className="mt-4">
                <motion.h2 
                  className="font-serif text-2xl font-bold mb-6 text-primary text-center"
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                >
                  Servicios de Farmacia
                </motion.h2>
                {renderServiceGrid(PHARMACY_SERVICES)}
              </TabsContent>
              
              <TabsContent value="centro-medico" className="mt-4">
                <motion.h2 
                  className="font-serif text-2xl font-bold mb-6 text-primary text-center"
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                >
                  Servicios del Centro Médico
                </motion.h2>
                {renderServiceGrid(MEDICAL_SERVICES)}
              </TabsContent>
            </Tabs>
          )}
          
          {!currentSelectedService && (
            <motion.div 
              className="mt-16 bg-white rounded-lg shadow-md p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h2 className="font-serif text-2xl font-bold mb-6 text-primary text-center">¿No encuentra lo que busca?</h2>
              <p className="text-neutral-700 text-center mb-6">
                Si tiene alguna necesidad específica o desea información sobre servicios no listados, 
                no dude en contactar con nosotros. Estaremos encantados de ayudarle.
              </p>
              <div className="flex justify-center">
                <a href="#contacto">
                  <Button className="bg-primary text-white hover:bg-primary-dark">
                    Contactar ahora
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-neutral-800">Nuestro Equipo Profesional</h2>
            <div className="w-20 h-1 bg-primary mx-auto mb-6"></div>
            <p className="text-neutral-700 max-w-2xl mx-auto">
              Contamos con un equipo multidisciplinar de profesionales altamente cualificados y comprometidos con su salud y bienestar.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Team member cards would go here - using placeholder cards */}
            <Card className="overflow-hidden">
              <div className="h-64 bg-neutral-200 relative">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Dr. Carlos Martínez" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-serif text-lg font-bold mb-1">Dr. Carlos Martínez</h3>
                <p className="text-primary text-sm font-medium mb-2">Farmacéutico Titular</p>
                <p className="text-neutral-700 text-sm">
                  Especialista en atención farmacéutica y seguimiento farmacoterapéutico con más de 15 años de experiencia.
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-64 bg-neutral-200 relative">
                <img 
                  src="https://randomuser.me/api/portraits/women/28.jpg" 
                  alt="Dra. Ana Sánchez" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-serif text-lg font-bold mb-1">Dra. Ana Sánchez</h3>
                <p className="text-primary text-sm font-medium mb-2">Médico General</p>
                <p className="text-neutral-700 text-sm">
                  Especialista en medicina familiar con amplia experiencia en el tratamiento de patologías crónicas.
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-64 bg-neutral-200 relative">
                <img 
                  src="https://randomuser.me/api/portraits/men/45.jpg" 
                  alt="Dr. Miguel López" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-serif text-lg font-bold mb-1">Dr. Miguel López</h3>
                <p className="text-primary text-sm font-medium mb-2">Farmacéutico Adjunto</p>
                <p className="text-neutral-700 text-sm">
                  Experto en dermofarmacia y productos de parafarmacia, siempre dispuesto a ofrecerle el mejor consejo.
                </p>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-64 bg-neutral-200 relative">
                <img 
                  src="https://randomuser.me/api/portraits/women/36.jpg" 
                  alt="Laura Gómez" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-serif text-lg font-bold mb-1">Laura Gómez</h3>
                <p className="text-primary text-sm font-medium mb-2">Fisioterapeuta</p>
                <p className="text-neutral-700 text-sm">
                  Especializada en rehabilitación y fisioterapia deportiva, con técnicas innovadoras de tratamiento.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">¿Necesita más información sobre nuestros servicios?</h2>
            <p className="text-white/90 mb-8 text-lg">
              No dude en contactar con nosotros para resolver cualquier duda o solicitar información adicional sobre nuestros servicios.
              Estaremos encantados de atenderle y ofrecerle la mejor solución para sus necesidades.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="#contacto">
                <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Contactar ahora
                </Button>
              </a>
              <a href="tel:+34900000000">
                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                  <i className="fas fa-phone-alt mr-2"></i>
                  Llamar: 900 000 000
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
