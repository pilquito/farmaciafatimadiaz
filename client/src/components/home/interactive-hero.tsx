import { scrollToElement } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function InteractiveHero() {
  return (
    <section id="inicio" className="relative h-screen md:h-[32rem] overflow-hidden">
      {/* Hero background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center" 
        style={{ 
          backgroundImage: "url('https://pixabay.com/get/gb5fc9da580e1a31749d1478cecb1153690f270978c557249d704c4d925c724a32d64192060e95663ab93eee14e123275055263cd2c43a5bbc72e9cadfa645032_1280.jpg')",
          zIndex: -1 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary-dark/80"></div>
      </div>
      
      <div className="container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-3xl text-white">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            Bienvenido a su Farmacia y Centro Médico de confianza
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Ofrecemos servicios profesionales de farmacia y atención médica de calidad para el cuidado integral de su salud.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white text-primary hover:bg-neutral-100"
              onClick={() => scrollToElement('servicios')}
            >
              Explorar Servicios
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="bg-transparent border-2 border-white text-white hover:bg-white/10"
              onClick={() => scrollToElement('contacto')}
            >
              Contactar Ahora
            </Button>
          </div>
        </div>
      </div>
      
      {/* Interactive 3D-like navigation elements */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div className="bg-white/90 backdrop-blur-sm p-5 rounded-full shadow-lg flex items-center space-x-8 floating-nav">
          <a href="#farmacia" className="flex flex-col items-center group">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-white transition">
              <i className="fas fa-prescription-bottle-alt text-xl text-primary group-hover:text-white"></i>
            </div>
            <span className="mt-2 text-sm font-medium">Farmacia</span>
          </a>
          
          <a href="#centro-medico" className="flex flex-col items-center group">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-white transition">
              <i className="fas fa-stethoscope text-xl text-primary group-hover:text-white"></i>
            </div>
            <span className="mt-2 text-sm font-medium">Centro Médico</span>
          </a>
          
          <a href="/citas" className="flex flex-col items-center group">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full group-hover:bg-primary group-hover:text-white transition">
              <i className="fas fa-calendar-check text-xl text-primary group-hover:text-white"></i>
            </div>
            <span className="mt-2 text-sm font-medium">Pedir Cita</span>
          </a>
        </div>
      </div>
    </section>
  );
}
