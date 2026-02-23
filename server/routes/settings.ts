import { Router, Request, Response } from "express";
import { z } from "zod";

// Esquema para validar los datos de configuración
const legalSettingsSchema = z.object({
  privacyPolicy: z.string(),
  cookiesPolicy: z.string(),
  termsAndConditions: z.string(),
});

// Datos predeterminados para textos legales
const defaultLegalSettings = {
  privacyPolicy: `<h2>Política de Privacidad de Farmacia Fátima Díaz Guillén</h2>
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
<p>Si tiene preguntas sobre esta política de privacidad, puede contactarnos en: <a href="mailto:info@farmaciafatimadiaz.com">info@farmaciafatimadiaz.com</a></p>`,
  cookiesPolicy: `<h2>Política de Cookies de Farmacia Fátima Díaz Guillén</h2>
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
<p>Si tiene preguntas sobre nuestra política de cookies, puede contactarnos en: <a href="mailto:info@farmaciafatimadiaz.com">info@farmaciafatimadiaz.com</a></p>`,
  termsAndConditions: `<h2>Términos y Condiciones de Farmacia Fátima Díaz Guillén</h2>
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
<p>Si tiene preguntas sobre estos términos y condiciones, puede contactarnos en: <a href="mailto:info@farmaciafatimadiaz.com">info@farmaciafatimadiaz.com</a></p>`
};

// Configuración en memoria para almacenar los textos legales
// En una implementación real, esto debería guardarse en la base de datos
let legalSettings = { ...defaultLegalSettings };

// Crear el router para las rutas de configuración
const settingsRouter = Router();

// Ruta para obtener todas las configuraciones
settingsRouter.get("/", (req: Request, res: Response) => {
  res.json({
    legal: legalSettings,
  });
});

// Ruta para obtener solo los textos legales
settingsRouter.get("/legal", (req: Request, res: Response) => {
  res.json(legalSettings);
});

// Ruta para actualizar los textos legales
settingsRouter.put("/legal", (req: Request, res: Response) => {
  try {
    const validatedData = legalSettingsSchema.parse(req.body);
    legalSettings = { ...legalSettings, ...validatedData };
    res.json({ success: true, data: legalSettings });
  } catch (error) {
    console.error("Error al actualizar textos legales:", error);
    res.status(400).json({ success: false, message: "Datos inválidos", error });
  }
});

// Ruta para obtener configuración de seguridad
settingsRouter.get("/security", (req: Request, res: Response) => {
  try {
    // Por ahora devolvemos una configuración por defecto
    // En el futuro esto se podría almacenar en la base de datos
    const securityConfig = {
      enableCaptcha: true, // Por defecto habilitado
      captchaType: "google",
      captchaSiteKey: process.env.CAPTCHA_SITE_KEY || "",
      requireStrongPasswords: true,
      maxLoginAttempts: 3,
      sessionTimeout: 3600
    };
    
    res.json(securityConfig);
  } catch (error) {
    console.error("Error al obtener configuración de seguridad:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

export default settingsRouter;