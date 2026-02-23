import nodemailer from 'nodemailer';

// Configuración para el transporte de correo
let transporter: nodemailer.Transporter;

// Configurar transporte con servidor propio
function createEmailTransporter() {
  // Configuración usando variables de entorno
  const emailConfig = {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true para 465, false para otros puertos
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // Configuraciones adicionales para servidores propios
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false'
    }
  };

  // Si no hay configuración SMTP, usar transporte de prueba
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('No se encontró configuración SMTP. Usando modo de prueba...');
    return createTestTransporter();
  }

  transporter = nodemailer.createTransport(emailConfig);
  console.log(`Servicio de email configurado con servidor: ${emailConfig.host}:${emailConfig.port}`);
  return transporter;
}

// Crear un transporte de prueba para desarrollo
async function createTestTransporter() {
  try {
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    console.log('Cuenta de prueba de email creada:', testAccount.user);
    console.log('Puedes ver los emails enviados en: https://ethereal.email');
    
    return transporter;
  } catch (error) {
    console.error('Error creando cuenta de prueba:', error);
    throw error;
  }
}

// Inicializar el transporte de correo
export async function initializeEmailService() {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      await createTestTransporter();
    } else {
      createEmailTransporter();
    }
    console.log('Servicio de email inicializado correctamente');
  } catch (error) {
    console.error('Error al inicializar el servicio de email:', error);
    throw error;
  }
}

// Interfaz para el envío de correo
export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

// Función para enviar un correo
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; previewUrl?: string; error?: any }> {
  if (!transporter) {
    await initializeEmailService();
  }
  
  try {
    // Configuración por defecto del remitente
    const from = options.from || process.env.SMTP_FROM || 'Farmacia y Centro Médico <noreply@farmaciacentromedico.com>';
    
    // Enviar el email
    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      attachments: options.attachments,
    });
    
    console.log('Mensaje enviado:', info.messageId);
    
    // La URL de vista previa solo está disponible cuando se usa Ethereal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('URL de vista previa:', previewUrl);
    }
    
    return {
      success: true,
      previewUrl: typeof previewUrl === 'string' ? previewUrl : undefined,
    };
  } catch (error) {
    console.error('Error al enviar email:', error);
    return {
      success: false,
      error,
    };
  }
}

// Plantillas para diferentes tipos de correos

// Plantilla para notificación de nuevo contacto
export function getContactNotificationTemplate(contactData: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string | null;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #2e7d32;">Nuevo Mensaje de Contacto</h2>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <p><strong>Nombre:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        ${contactData.phone ? `<p><strong>Teléfono:</strong> ${contactData.phone}</p>` : ''}
        <p><strong>Asunto:</strong> ${contactData.subject}</p>
      </div>
      
      <div style="border-left: 3px solid #2e7d32; padding-left: 15px; margin-bottom: 20px;">
        <h3 style="color: #555;">Mensaje:</h3>
        <p style="white-space: pre-line;">${contactData.message}</p>
      </div>
      
      <div style="font-size: 13px; color: #777; margin-top: 30px; text-align: center;">
        <p>Este es un correo automático, por favor no responda a esta dirección.</p>
      </div>
    </div>
  `;
  
  return {
    subject: `Nuevo contacto: ${contactData.subject}`,
    html,
    text: `Nuevo mensaje de contacto de ${contactData.name} (${contactData.email})
Asunto: ${contactData.subject}
${contactData.phone ? `Teléfono: ${contactData.phone}` : ''}

Mensaje:
${contactData.message}
    `,
  };
}

// Plantilla para respuesta automática al contacto
export function getContactAutoReplyTemplate(contactData: {
  name: string;
  subject: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #2e7d32;">Hemos recibido tu mensaje</h2>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p>Estimado/a ${contactData.name},</p>
        <p>Gracias por ponerte en contacto con nosotros. Hemos recibido tu mensaje sobre "${contactData.subject}" y te responderemos lo antes posible.</p>
        <p>Este es un correo automático de confirmación. Tu consulta es importante para nosotros y será atendida por nuestro equipo.</p>
      </div>
      
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
        <p>Si tu consulta es urgente, puedes contactarnos por teléfono al:</p>
        <p style="text-align: center; font-weight: bold; font-size: 18px;">+52 123 456 7890</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e1e1e1; padding-top: 20px;">
        <p style="font-size: 14px; color: #555;">
          Farmacia Fátima Díaz Guillén y Centro Médico Clodina<br>
          CALLE NICARAGUA 2, 38500, Guimar (Tenerife)<br>
          Teléfono: 922 51 21 51<br>
          Email: info@farmaciafatimadiaz.com
        </p>
      </div>
    </div>
  `;
  
  return {
    subject: `Recibimos tu mensaje: ${contactData.subject}`,
    html,
    text: `Hemos recibido tu mensaje

Estimado/a ${contactData.name},

Gracias por ponerte en contacto con nosotros. Hemos recibido tu mensaje sobre "${contactData.subject}" y te responderemos lo antes posible.

Este es un correo automático de confirmación. Tu consulta es importante para nosotros y será atendida por nuestro equipo.

Si tu consulta es urgente, puedes contactarnos por teléfono al: +52 123 456 7890

Farmacia Fátima Díaz Guillén y Centro Médico Clodina
Av. Principal #123, Ciudad, CP 12345
www.farmaciacentromedico.com
    `,
  };
}

// Plantilla para confirmación de cita
export function getAppointmentConfirmationTemplate(appointmentData: {
  name: string;
  date: string;
  time: string;
  doctor: string;
  specialty: string;
  email: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #2e7d32;">✅ Cita Médica Confirmada</h2>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p>Estimado/a ${appointmentData.name},</p>
        <p><strong>¡Tu cita médica ha sido confirmada exitosamente!</strong></p>
        <p>A continuación encontrarás todos los detalles de tu cita:</p>
      </div>
      
      <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; border-left: 4px solid #2e7d32; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #2e7d32;">📅 Fecha:</td>
            <td style="padding: 8px 0; font-size: 16px;">${appointmentData.date}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #2e7d32;">⏰ Hora:</td>
            <td style="padding: 8px 0; font-size: 16px;">${appointmentData.time}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #2e7d32;">🏥 Especialidad:</td>
            <td style="padding: 8px 0; font-size: 16px;">${appointmentData.specialty}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #2e7d32;">👨‍⚕️ Doctor/a:</td>
            <td style="padding: 8px 0; font-size: 16px;">${appointmentData.doctor}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
        <h3 style="color: #856404; margin-top: 0;">📋 Instrucciones importantes:</h3>
        <ul style="padding-left: 20px; color: #856404;">
          <li><strong>Llega 15 minutos antes</strong> de la hora programada para el registro.</li>
          <li>Trae contigo tu <strong>identificación oficial</strong> y tarjeta de seguro médico (si aplica).</li>
          <li>Si tomas medicamentos, prepara una <strong>lista actualizada</strong> de todos ellos.</li>
          <li>Para cancelar o reprogramar, notifícanos con <strong>al menos 24 horas</strong> de anticipación.</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 20px 0;">
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 2px dashed #6c757d;">
          <p style="margin: 0; color: #495057; font-weight: bold;">💡 ¿Necesitas ayuda?</p>
          <p style="margin: 5px 0 0 0; color: #6c757d;">Llámanos al <strong>+52 123 456 7890</strong></p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e1e1e1; padding-top: 20px;">
        <p style="font-size: 14px; color: #555; margin: 0;">
          <strong>Centro Médico Clodina</strong><br>
          Av. Principal #123, Ciudad, CP 12345<br>
          📞 +52 123 456 7890 | 🌐 www.centromedicoclodina.com
        </p>
      </div>
      
      <div style="font-size: 12px; color: #999; margin-top: 20px; text-align: center; padding-top: 15px; border-top: 1px solid #f0f0f0;">
        <p>Este es un correo automático de confirmación. Por favor, no respondas a esta dirección.</p>
      </div>
    </div>
  `;
  
  return {
    subject: `✅ Cita confirmada - ${appointmentData.date} a las ${appointmentData.time}`,
    html,
    text: `CITA MÉDICA CONFIRMADA

Estimado/a ${appointmentData.name},

¡Tu cita médica ha sido confirmada exitosamente!

DETALLES DE TU CITA:
📅 Fecha: ${appointmentData.date}
⏰ Hora: ${appointmentData.time}
🏥 Especialidad: ${appointmentData.specialty}
👨‍⚕️ Doctor/a: ${appointmentData.doctor}

INSTRUCCIONES IMPORTANTES:
• Llega 15 minutos antes de la hora programada para el registro
• Trae contigo tu identificación oficial y tarjeta de seguro médico (si aplica)
• Si tomas medicamentos, prepara una lista actualizada de todos ellos
• Para cancelar o reprogramar, notifícanos con al menos 24 horas de anticipación

¿Necesitas ayuda? Llámanos al +52 123 456 7890

Centro Médico Clodina
Av. Principal #123, Ciudad, CP 12345
📞 +52 123 456 7890 | 🌐 www.centromedicoclodina.com

Este es un correo automático de confirmación. Por favor, no respondas a esta dirección.
    `,
  };
}

// Plantilla para respuesta personalizada a un mensaje de contacto
export function getContactReplyTemplate(replyData: {
  name: string;
  originalSubject: string;
  replyMessage: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #2e7d32;">Respuesta a tu mensaje</h2>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p>Estimado/a ${replyData.name},</p>
        <p>Gracias por ponerte en contacto con nosotros respecto a "${replyData.originalSubject}".</p>
      </div>
      
      <div style="border-left: 3px solid #2e7d32; padding-left: 15px; margin-bottom: 20px;">
        <p style="white-space: pre-line;">${replyData.replyMessage}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p>Si tienes alguna otra pregunta, no dudes en contactarnos.</p>
        <p>¡Que tengas un excelente día!</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e1e1e1; padding-top: 20px;">
        <p style="font-size: 14px; color: #555;">
          Farmacia Fátima Díaz Guillén y Centro Médico Clodina<br>
          Av. Principal #123, Ciudad, CP 12345<br>
          Teléfono: +52 123 456 7890<br>
          www.farmaciacentromedico.com
        </p>
      </div>
    </div>
  `;
  
  return {
    subject: `Re: ${replyData.originalSubject}`,
    html,
    text: `Respuesta a tu mensaje

Estimado/a ${replyData.name},

Gracias por ponerte en contacto con nosotros respecto a "${replyData.originalSubject}".

${replyData.replyMessage}

Si tienes alguna otra pregunta, no dudes en contactarnos.
¡Que tengas un excelente día!

Farmacia Fátima Díaz Guillén y Centro Médico Clodina
Av. Principal #123, Ciudad, CP 12345
Teléfono: +52 123 456 7890
www.farmaciacentromedico.com
    `,
  };
}