import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link } from "wouter";

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Comprobar si el usuario ya ha aceptado las cookies
    const cookiesAccepted = localStorage.getItem("cookiesAccepted");
    if (!cookiesAccepted) {
      // Mostrar el aviso después de un pequeño retraso para mejorar la experiencia
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookiesAccepted", "true");
    setShowConsent(false);
  };

  const rejectCookies = () => {
    // Solo se guardan las cookies esenciales
    localStorage.setItem("cookiesAccepted", "essential");
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-black bg-opacity-40 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto border border-primary/20 shadow-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-primary"
            >
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <path d="M8.5 8.5v.01" />
              <path d="M16 15.5v.01" />
              <path d="M12 12v.01" />
              <path d="M11 17v.01" />
              <path d="M7 14v.01" />
            </svg>
            <h3 className="text-lg font-semibold">Política de Cookies</h3>
          </div>
          <p className="text-sm text-neutral-700 mb-3 leading-relaxed">
            Utilizamos cookies propias y de terceros para mejorar nuestros servicios, 
            elaborar información estadística y analizar sus hábitos de navegación.
            Estas nos permiten ofrecerle una experiencia personalizada.
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed">
            Puede aceptar todas las cookies pulsando el botón "Aceptar todas" o configurarlas 
            o rechazar su uso visitando nuestra{" "}
            <Link href="/politica-cookies" className="text-primary hover:underline font-medium">
              Política de Cookies
            </Link>.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t pt-4">
          <Button
            variant="outline"
            onClick={rejectCookies}
            className="text-neutral-700 hover:bg-neutral-100 font-medium"
          >
            Solo esenciales
          </Button>
          <Button 
            onClick={acceptCookies}
            className="bg-primary hover:bg-primary-dark text-white font-medium"
          >
            Aceptar todas
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}