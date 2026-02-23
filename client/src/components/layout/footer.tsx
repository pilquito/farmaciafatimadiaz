import { Link } from "wouter";
import { useConfig } from "@/contexts/config-context";

export default function Footer() {
  const { contactSettings } = useConfig();
  
  const { 
    businessName, 
    address, 
    city, 
    state, 
    postalCode, 
    phone1,
    email, 
    schedule,
    facebook,
    instagram,
    twitter
  } = contactSettings;

  const formattedAddress = `${address}<br />${city}, ${state}<br />${postalCode}`;
  const formattedSchedule = schedule.replace(/,/g, '<br />');
  
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div>
            <p className="text-neutral-400 mb-4">
              Su farmacia y centro médico de confianza, ofreciendo servicios profesionales para el cuidado integral de su salud.
            </p>
            <div className="flex space-x-4">
              <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href={instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href={twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://youtube.com/farmaciadiaz" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary transition" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Enlaces rápidos</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-neutral-400 hover:text-white transition">Inicio</Link></li>
              <li><Link to="/equipo" className="text-neutral-400 hover:text-white transition">Quiénes Somos</Link></li>
              <li><Link to="/servicios" className="text-neutral-400 hover:text-white transition">Servicios</Link></li>
              <li><Link to="/blog" className="text-neutral-400 hover:text-white transition">Blog</Link></li>
              <li><Link to="/testimonios" className="text-neutral-400 hover:text-white transition">Testimonios</Link></li>
              <li><Link to="/contacto" className="text-neutral-400 hover:text-white transition">Contacto</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Servicios destacados</h4>
            <ul className="space-y-2">
              <li><Link to="/servicios/farmacia" className="text-neutral-400 hover:text-white transition">Dispensación de Medicamentos</Link></li>
              <li><Link to="/servicios/farmacia" className="text-neutral-400 hover:text-white transition">Seguimiento Farmacoterapéutico</Link></li>
              <li><Link to="/servicios/consultas" className="text-neutral-400 hover:text-white transition">Consultas Médicas</Link></li>
              <li><Link to="/servicios/analisis" className="text-neutral-400 hover:text-white transition">Análisis Clínicos</Link></li>
              <li><Link to="/servicios/fisioterapia" className="text-neutral-400 hover:text-white transition">Fisioterapia</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-3 text-primary" aria-hidden="true"></i>
                <span dangerouslySetInnerHTML={{ __html: formattedAddress }}></span>
              </li>
              <li className="flex items-start">
                <i className="fas fa-phone-alt mt-1 mr-3 text-primary" aria-hidden="true"></i>
                <a href={`tel:+52${phone1.replace(/\s/g, '')}`} className="text-neutral-400 hover:text-white transition">{phone1}</a>
              </li>
              <li className="flex items-start">
                <i className="fas fa-envelope mt-1 mr-3 text-primary" aria-hidden="true"></i>
                <a href={`mailto:${email}`} className="text-neutral-400 hover:text-white transition">{email}</a>
              </li>
              <li className="flex items-start">
                <i className="fas fa-clock mt-1 mr-3 text-primary" aria-hidden="true"></i>
                <span dangerouslySetInnerHTML={{ __html: formattedSchedule }}></span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-6 text-center text-neutral-500 text-sm">
          <p>&copy; {new Date().getFullYear()} {businessName} & Centro Médico Clodina. Todos los derechos reservados.</p>
          <div className="flex flex-col md:flex-row justify-center md:space-x-4 space-y-2 md:space-y-0 mt-3">
            <Link to="/terminos-condiciones" className="hover:text-white transition">Aviso Legal</Link>
            <span className="hidden md:inline">|</span>
            <Link to="/politica-privacidad" className="hover:text-white transition">Política de Privacidad</Link>
            <span className="hidden md:inline">|</span>
            <Link to="/politica-cookies" className="hover:text-white transition">Política de Cookies</Link>
            <span className="hidden md:inline">|</span>
            <Link to="/admin/login" className="opacity-60 hover:opacity-100 hover:text-white transition">Área Privada</Link>
          </div>
        </div>
      </div>
      
      {/* Floating appointment button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link 
          to="/citas" 
          className="flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition"
          aria-label="Pedir cita"
        >
          <i className="fas fa-calendar-check text-xl" aria-hidden="true"></i>
        </Link>
      </div>
    </footer>
  );
}
