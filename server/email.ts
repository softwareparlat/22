import nodemailer from "nodemailer";

console.log('📧 Configurando transporter de email:', {
  user: process.env.GMAIL_USER || "jhonidelacruz89@gmail.com",
  hasPass: !!(process.env.GMAIL_PASS || "htzmerglesqpdoht")
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "jhonidelacruz89@gmail.com",
    pass: process.env.GMAIL_PASS || "htzmerglesqpdoht",
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    console.log(`📧 Enviando email a: ${options.to}, Asunto: ${options.subject}`);
    await transporter.sendMail({
      from: `"SoftwarePar" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log(`📧 Email enviado exitosamente a: ${options.to}`);
  } catch (error) {
    console.error("Error enviando email:", error);
    throw new Error("Error enviando email");
  }
};

export const sendWelcomeEmail = async (email: string, name: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bienvenido a SoftwarePar</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">¡Bienvenido a SoftwarePar!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu cuenta ha sido creada exitosamente</p>
      </div>

      <div style="padding: 30px 0;">
        <h2 style="color: #1e40af;">Hola ${name},</h2>
        <p>Gracias por unirte a SoftwarePar. Estamos emocionados de tenerte en nuestra plataforma.</p>

        <p>Con tu cuenta puedes:</p>
        <ul style="color: #666;">
          <li>Solicitar cotizaciones para tus proyectos</li>
          <li>Hacer seguimiento del progreso de tus desarrollos</li>
          <li>Acceder a soporte técnico especializado</li>
          <li>Gestionar tus facturas y pagos</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://softwarepar.lat" style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Acceder a mi Dashboard</a>
        </div>

        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>

        <p style="margin-top: 30px;">
          Saludos,<br>
          <strong>El equipo de SoftwarePar</strong>
        </p>
      </div>

      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #666; font-size: 14px;">
        <p>SoftwarePar - Desarrollo de Software Profesional</p>
        <p>Buenos Aires, Argentina | info@softwarepar.lat</p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: "¡Bienvenido a SoftwarePar!",
    html,
  });
};

export const sendContactNotification = async (contactData: any): Promise<void> => {
  console.log(`📧 Enviando notificación de contacto a admin: ${process.env.GMAIL_USER || "jhonidelacruz89@gmail.com"} para ${contactData.fullName}`);
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nueva Consulta - SoftwarePar</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #1e40af; color: white; padding: 20px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0;">Nueva Consulta Recibida</h1>
      </div>

      <div style="padding: 20px 0;">
        <h2>Detalles del Contacto:</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Nombre:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${contactData.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${contactData.email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Empresa:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${contactData.company || "No especificada"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Modalidad:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${contactData.serviceType || "No especificada"}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Presupuesto:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${contactData.budget || "No especificado"}</td>
          </tr>
        </table>

        <h3>Mensaje:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; border-left: 4px solid #1e40af;">
          ${contactData.message}
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: process.env.GMAIL_USER || "jhonidelacruz89@gmail.com",
    subject: `Nueva consulta de ${contactData.fullName}`,
    html,
  });
};

export const sendPartnerCommissionNotification = async (
  partnerEmail: string,
  partnerName: string,
  commission: string,
  projectName: string
): Promise<void> => {
  console.log(`📧 Enviando notificación de comisión a ${partnerEmail} para ${partnerName} por el proyecto ${projectName}`);
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nueva Comisión - SoftwarePar</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">¡Nueva Comisión Generada!</h1>
        <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">$${commission}</p>
      </div>

      <div style="padding: 30px 0;">
        <h2 style="color: #059669;">¡Felicitaciones ${partnerName}!</h2>
        <p>Has generado una nueva comisión por la venta del proyecto <strong>"${projectName}"</strong>.</p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #059669;">Detalles de la comisión:</h3>
          <p style="margin: 5px 0;"><strong>Proyecto:</strong> ${projectName}</p>
          <p style="margin: 5px 0;"><strong>Comisión:</strong> $${commission}</p>
          <p style="margin: 5px 0;"><strong>Estado:</strong> Procesada</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="https://softwarepar.lat" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Dashboard</a>
        </div>

        <p>¡Sigue refiriendo clientes y genera más ingresos!</p>

        <p style="margin-top: 30px;">
          Saludos,<br>
          <strong>El equipo de SoftwarePar</strong>
        </p>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: partnerEmail,
    subject: `¡Nueva comisión de $${commission} generada!`,
    html,
  });
};