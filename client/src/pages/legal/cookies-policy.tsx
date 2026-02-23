import { useQuery } from "@tanstack/react-query";
import { LegalDocument } from "@/components/ui/legal-document";

export default function CookiesPolicyPage() {
  // Consultar la política de cookies desde la API
  const { data, isLoading } = useQuery<{
    privacyPolicy: string;
    cookiesPolicy: string;
    termsAndConditions: string;
  }>({
    queryKey: ['/api/settings/legal'],
  });

  const defaultCookiesPolicy = `
    <h2>Política de Cookies de Farmacia Fátima Díaz Guillén</h2>
    <p>Esta política de cookies explica qué son las cookies, cómo las utilizamos en nuestro sitio web y qué opciones tiene respecto a ellas.</p>
    <h3>¿Qué son las cookies?</h3>
    <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. Estas cookies nos permiten reconocer su dispositivo y recordar información sobre su visita.</p>
    <h3>Tipos de cookies que utilizamos</h3>
    <ul>
    <li><strong>Cookies esenciales:</strong> Necesarias para el funcionamiento básico del sitio web.</li>
    <li><strong>Cookies de funcionalidad:</strong> Mejoran su experiencia de navegación recordando sus preferencias.</li>
    <li><strong>Cookies analíticas:</strong> Nos ayudan a entender cómo utiliza nuestro sitio web para mejorar su funcionamiento.</li>
    <li><strong>Cookies de marketing:</strong> Utilizadas para mostrarle anuncios relevantes basados en sus intereses.</li>
    </ul>
    <h3>Control de cookies</h3>
    <p>Puede controlar y gestionar las cookies en la configuración de su navegador. Sin embargo, deshabilitar ciertas cookies puede afectar la funcionalidad de nuestro sitio web.</p>
    <h3>Contacto</h3>
    <p>Si tiene preguntas sobre nuestra política de cookies, puede contactarnos en: <a href="mailto:info@farmaciafatimadiaz.com">info@farmaciafatimadiaz.com</a></p>
  `;

  return (
    <LegalDocument
      title="Política de Cookies"
      metaDescription="Política de cookies de Farmacia Fátima Díaz Guillén. Información sobre cómo utilizamos las cookies en nuestro sitio web."
      breadcrumbPath="/politica-cookies"
      breadcrumbLabel="Política de Cookies"
      content={data?.cookiesPolicy || defaultCookiesPolicy}
      isLoading={isLoading}
    />
  );
}