import { useQuery } from "@tanstack/react-query";
import { LegalDocument } from "@/components/ui/legal-document";

export default function PrivacyPolicyPage() {
  // Consultar la política de privacidad desde la API
  const { data, isLoading } = useQuery<{
    privacyPolicy: string;
    cookiesPolicy: string;
    termsAndConditions: string;
  }>({
    queryKey: ['/api/settings/legal'],
  });

  const defaultPrivacyPolicy = `
    <h2>Política de Privacidad de Farmacia Fátima Díaz Guillén</h2>
    <p>En Farmacia Fátima Díaz Guillén, con domicilio en Avenida Principal 123, valoramos y respetamos su privacidad. Esta política de privacidad describe cómo recopilamos, utilizamos y protegemos la información personal que usted nos proporciona.</p>
    <h3>Información que recopilamos</h3>
    <p>Recopilamos información personal como nombre, dirección, correo electrónico, número de teléfono y, en algunos casos, información médica relevante para brindarle nuestros servicios farmacéuticos y médicos.</p>
    <h3>Uso de la información</h3>
    <p>Utilizamos su información personal para:</p>
    <ul>
    <li>Procesar y gestionar sus pedidos de medicamentos</li>
    <li>Programar y administrar sus citas médicas</li>
    <li>Brindarle información sobre productos y servicios que puedan ser de su interés</li>
    <li>Mejorar continuamente nuestros servicios</li>
    </ul>
    <h3>Protección de datos</h3>
    <p>Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra acceso no autorizado, alteración o divulgación.</p>
    <h3>Contacto</h3>
    <p>Si tiene preguntas sobre esta política de privacidad, puede contactarnos en: <a href="mailto:info@farmaciafatimadiaz.com">info@farmaciafatimadiaz.com</a></p>
  `;

  return (
    <LegalDocument
      title="Política de Privacidad"
      metaDescription="Política de privacidad de Farmacia Fátima Díaz Guillén. Información sobre cómo recopilamos y protegemos sus datos personales."
      breadcrumbPath="/politica-privacidad"
      breadcrumbLabel="Política de Privacidad"
      content={data?.privacyPolicy || defaultPrivacyPolicy}
      isLoading={isLoading}
    />
  );
}