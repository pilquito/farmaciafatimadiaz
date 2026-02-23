import { useQuery } from "@tanstack/react-query";
import { LegalDocument } from "@/components/ui/legal-document";

export default function TermsConditionsPage() {
  // Consultar los términos y condiciones desde la API
  const { data, isLoading } = useQuery<{
    privacyPolicy: string;
    cookiesPolicy: string;
    termsAndConditions: string;
  }>({
    queryKey: ['/api/settings/legal'],
  });

  const defaultTermsAndConditions = `
    <h2>Términos y Condiciones de Farmacia Fátima Díaz Guillén</h2>
    <p>Al utilizar nuestro sitio web y servicios, usted acepta estos términos y condiciones. Por favor, léalos cuidadosamente.</p>
    <h3>Servicios ofrecidos</h3>
    <p>Farmacia Fátima Díaz Guillén ofrece servicios farmacéuticos y de atención médica básica, incluyendo venta de medicamentos, programación de citas médicas, y asesoramiento farmacéutico.</p>
    <h3>Responsabilidad médica y farmacéutica</h3>
    <p>La información proporcionada en nuestro sitio web tiene fines informativos y no sustituye el consejo médico profesional. Siempre consulte a un profesional de la salud para diagnósticos y tratamientos médicos.</p>
    <h3>Uso del sitio web</h3>
    <p>Al utilizar nuestro sitio web, usted se compromete a:</p>
    <ul>
    <li>No utilizar el sitio para fines ilegales o no autorizados</li>
    <li>No intentar dañar, deshabilitar o sobrecargar nuestros servidores</li>
    <li>Proporcionar información veraz y precisa en los formularios que complete</li>
    </ul>
    <h3>Propiedad intelectual</h3>
    <p>Todo el contenido del sitio web, incluyendo textos, gráficos, logotipos, imágenes y software, está protegido por derechos de autor y otras leyes de propiedad intelectual.</p>
    <h3>Modificaciones</h3>
    <p>Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio web.</p>
    <h3>Contacto</h3>
    <p>Si tiene preguntas sobre estos términos y condiciones, puede contactarnos en: <a href="mailto:info@farmaciafatimadiaz.com">info@farmaciafatimadiaz.com</a></p>
  `;

  return (
    <LegalDocument
      title="Términos y Condiciones"
      metaDescription="Términos y condiciones de Farmacia Fátima Díaz Guillén. Información sobre el uso de nuestros servicios y responsabilidades."
      breadcrumbPath="/terminos-condiciones"
      breadcrumbLabel="Términos y Condiciones"
      content={data?.termsAndConditions || defaultTermsAndConditions}
      isLoading={isLoading}
    />
  );
}