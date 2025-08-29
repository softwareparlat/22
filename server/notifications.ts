
import { db } from "./db";
import { notifications, users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "./email";
import { sendWhatsAppMessage, whatsappTemplates, getUserWhatsAppNumber } from "./whatsapp";
import { WebSocketServer } from "ws";

// Store WebSocket connections by user ID
const wsConnections = new Map<number, Set<any>>();

export interface NotificationData {
  userId: number;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  projectId?: number;
  ticketId?: number;
  metadata?: any;
}

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
}

export interface WhatsAppNotificationData {
  phoneNumber: string;
  template: keyof typeof whatsappTemplates;
  variables: any;
}

// Register WebSocket connection
export function registerWSConnection(userId: number, ws: any) {
  if (!wsConnections.has(userId)) {
    wsConnections.set(userId, new Set());
  }
  wsConnections.get(userId)!.add(ws);
  
  ws.on('close', () => {
    wsConnections.get(userId)?.delete(ws);
    if (wsConnections.get(userId)?.size === 0) {
      wsConnections.delete(userId);
    }
  });
}

// Send real-time notification via WebSocket
export function sendRealtimeNotification(userId: number, notification: any) {
  console.log(`🔔 Enviando notificación en tiempo real a usuario ${userId}:`, {
    title: notification.title,
    message: notification.message,
    type: notification.type
  });
  
  const userConnections = wsConnections.get(userId);
  if (userConnections && userConnections.size > 0) {
    console.log(`📡 Encontradas ${userConnections.size} conexiones para usuario ${userId}`);
    
    userConnections.forEach(ws => {
      if (ws.readyState === 1) { // OPEN
        const notificationData = {
          type: 'notification',
          data: notification,
          timestamp: new Date().toISOString(),
        };
        
        ws.send(JSON.stringify(notificationData));
        console.log(`✅ Notificación enviada por WebSocket a usuario ${userId}`);
      } else {
        console.log(`⚠️ Conexión WebSocket cerrada para usuario ${userId}`);
      }
    });
  } else {
    console.log(`❌ No hay conexiones WebSocket activas para usuario ${userId}`);
  }
}

// Create notification in database
export async function createNotification(data: NotificationData) {
  const notification = await db
    .insert(notifications)
    .values({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
    })
    .returning();

  // Send real-time notification
  sendRealtimeNotification(data.userId, notification[0]);
  
  return notification[0];
}

// Send comprehensive notification (DB + WebSocket + Email + WhatsApp)
export async function sendComprehensiveNotification(
  data: NotificationData,
  emailData?: EmailNotificationData,
  whatsappData?: WhatsAppNotificationData
) {
  // Create in database and send via WebSocket
  const notification = await createNotification(data);
  
  // Send email if provided
  if (emailData) {
    try {
      console.log(`📧 Enviando email a: ${emailData.to}`);
      console.log(`📧 Asunto: ${emailData.subject}`);
      await sendEmail(emailData);
      console.log(`✅ Email enviado exitosamente a: ${emailData.to}`);
    } catch (error) {
      console.error(`❌ Error enviando email a ${emailData.to}:`, error);
    }
  }

  // Send WhatsApp if provided
  if (whatsappData) {
    try {
      console.log(`📱 Enviando WhatsApp a: ${whatsappData.phoneNumber}`);
      
      // Generate message from template
      const template = whatsappTemplates[whatsappData.template];
      const message = template(...Object.values(whatsappData.variables));
      
      await sendWhatsAppMessage({
        to: whatsappData.phoneNumber,
        message,
      });
      console.log(`✅ WhatsApp enviado exitosamente a: ${whatsappData.phoneNumber}`);
    } catch (error) {
      console.error(`❌ Error enviando WhatsApp a ${whatsappData.phoneNumber}:`, error);
    }
  }
  
  return notification;
}

// Specific notification functions for different events

export async function notifyProjectCreated(clientId: number, adminIds: number[], projectName: string) {
  const client = await db.select().from(users).where(eq(users.id, clientId)).limit(1);
  const clientName = client[0]?.fullName || 'Cliente';
  
  // Notify admin
  for (const adminId of adminIds) {
    await sendComprehensiveNotification(
      {
        userId: adminId,
        title: '🚀 Nuevo Proyecto Creado',
        message: `${clientName} ha creado el proyecto "${projectName}"`,
        type: 'info',
      },
      {
        to: process.env.GMAIL_USER || 'jhonidelacruz89@gmail.com',
        subject: `Nuevo Proyecto: ${projectName}`,
        html: generateProjectCreatedEmailHTML(clientName, projectName, client[0]?.email),
      }
    );
  }
  
  // Confirm to client
  await sendComprehensiveNotification(
    {
      userId: clientId,
      title: '✅ Proyecto Creado Exitosamente',
      message: `Tu proyecto "${projectName}" ha sido creado y está siendo revisado`,
      type: 'success',
    }
  );
}

export async function notifyProjectUpdated(
  clientId: number, 
  projectName: string, 
  updateDescription: string,
  updatedBy: string
) {
  const client = await db.select().from(users).where(eq(users.id, clientId)).limit(1);
  
  await sendComprehensiveNotification(
    {
      userId: clientId,
      title: '📋 Proyecto Actualizado',
      message: `Tu proyecto "${projectName}" ha sido actualizado: ${updateDescription}`,
      type: 'info',
    },
    {
      to: client[0]?.email || '',
      subject: `Actualización en tu proyecto: ${projectName}`,
      html: generateProjectUpdateEmailHTML(projectName, updateDescription, updatedBy),
    }
  );
}

export async function notifyNewMessage(
  recipientId: number,
  senderName: string,
  projectName: string,
  message: string
) {
  const recipient = await db.select().from(users).where(eq(users.id, recipientId)).limit(1);
  const link = `${process.env.BASE_URL || 'https://softwarepar.lat'}/client/projects`;
  
  // Preparar datos de WhatsApp si el usuario tiene número
  let whatsappData = undefined;
  if (recipient[0]?.whatsappNumber) {
    whatsappData = {
      phoneNumber: recipient[0].whatsappNumber,
      template: 'projectUpdate' as const,
      variables: [recipient[0].fullName, projectName, link],
    };
  }
  
  await sendComprehensiveNotification(
    {
      userId: recipientId,
      title: '💬 Nuevo Mensaje',
      message: `${senderName} te ha enviado un mensaje en "${projectName}"`,
      type: 'info',
    },
    {
      to: recipient[0]?.email || '',
      subject: `Nuevo mensaje en proyecto: ${projectName}`,
      html: generateNewMessageEmailHTML(senderName, projectName, message),
    },
    whatsappData
  );
}

export async function notifyTicketCreated(adminIds: number[], clientName: string, ticketTitle: string) {
  for (const adminId of adminIds) {
    await sendComprehensiveNotification(
      {
        userId: adminId,
        title: '🎫 Nuevo Ticket de Soporte',
        message: `${clientName} ha creado el ticket: "${ticketTitle}"`,
        type: 'warning',
      },
      {
        to: process.env.GMAIL_USER || 'jhonidelacruz89@gmail.com',
        subject: `Nuevo Ticket: ${ticketTitle}`,
        html: generateTicketCreatedEmailHTML(clientName, ticketTitle),
      }
    );
  }
}

export async function notifyTicketResponse(
  recipientId: number,
  responderName: string,
  ticketTitle: string,
  response: string,
  isFromSupport: boolean
) {
  const recipient = await db.select().from(users).where(eq(users.id, recipientId)).limit(1);
  const notificationType = isFromSupport ? 'Respuesta de Soporte' : 'Nueva Respuesta';
  const link = `${process.env.BASE_URL || 'https://softwarepar.lat'}/client/support`;
  
  // Preparar datos de WhatsApp si el usuario tiene número
  let whatsappData = undefined;
  if (recipient[0]?.whatsappNumber) {
    whatsappData = {
      phoneNumber: recipient[0].whatsappNumber,
      template: 'newTicketResponse' as const,
      variables: [recipient[0].fullName, ticketTitle.substring(0, 3).padStart(3, '0'), link],
    };
  }
  
  await sendComprehensiveNotification(
    {
      userId: recipientId,
      title: `📞 ${notificationType}`,
      message: `${responderName} respondió a tu ticket: "${ticketTitle}"`,
      type: 'info',
    },
    {
      to: recipient[0]?.email || '',
      subject: `${notificationType}: ${ticketTitle}`,
      html: generateTicketResponseEmailHTML(responderName, ticketTitle, response, isFromSupport),
    },
    whatsappData
  );
}

export async function notifyPaymentStageAvailable(
  clientId: number,
  projectName: string,
  stageName: string,
  amount: string
) {
  const client = await db.select().from(users).where(eq(users.id, clientId)).limit(1);
  const link = `${process.env.BASE_URL || 'https://softwarepar.lat'}/client/projects`;
  
  // Preparar datos de WhatsApp si el usuario tiene número
  let whatsappData = undefined;
  if (client[0]?.whatsappNumber) {
    whatsappData = {
      phoneNumber: client[0].whatsappNumber,
      template: 'paymentReminder' as const,
      variables: [client[0].fullName, stageName, amount, link],
    };
  }
  
  await sendComprehensiveNotification(
    {
      userId: clientId,
      title: '💰 Pago Disponible',
      message: `Nueva etapa de pago disponible: ${stageName} - $${amount}`,
      type: 'success',
    },
    {
      to: client[0]?.email || '',
      subject: `Pago disponible para ${projectName}`,
      html: generatePaymentStageEmailHTML(projectName, stageName, amount),
    },
    whatsappData
  );
}

export async function notifyBudgetNegotiation(
  recipientId: number,
  projectName: string,
  proposedPrice: string,
  message: string,
  isCounterOffer: boolean = false
) {
  const recipient = await db.select().from(users).where(eq(users.id, recipientId)).limit(1);
  const title = isCounterOffer ? '💵 Contraoferta Recibida' : '💰 Nueva Negociación de Presupuesto';
  
  await sendComprehensiveNotification(
    {
      userId: recipientId,
      title,
      message: `Proyecto "${projectName}": Precio propuesto $${proposedPrice}`,
      type: 'warning',
    },
    {
      to: recipient[0]?.email || '',
      subject: `${title}: ${projectName}`,
      html: generateBudgetNegotiationEmailHTML(projectName, proposedPrice, message, isCounterOffer),
    }
  );
}

// Email HTML templates
function generateProjectCreatedEmailHTML(clientName: string, projectName: string, clientEmail?: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Nuevo Proyecto</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0;">🚀 Nuevo Proyecto Creado</h1>
      </div>
      <div style="padding: 30px 0;">
        <h2>¡Hola Admin!</h2>
        <p><strong>${clientName}</strong> ha creado un nuevo proyecto:</p>
        <div style="background: #f8fafc; border-left: 4px solid #1e40af; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${projectName}</h3>
          <p style="margin: 0;"><strong>Cliente:</strong> ${clientName}</p>
          ${clientEmail ? `<p style="margin: 0;"><strong>Email:</strong> ${clientEmail}</p>` : ''}
        </div>
        <p>Por favor revisa el proyecto y asígnale un estado apropiado.</p>
      </div>
    </body>
    </html>
  `;
}

function generateProjectUpdateEmailHTML(projectName: string, updateDescription: string, updatedBy: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Proyecto Actualizado</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0;">📋 Proyecto Actualizado</h1>
      </div>
      <div style="padding: 30px 0;">
        <h2>¡Tu proyecto ha sido actualizado!</h2>
        <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0;">${projectName}</h3>
          <p><strong>Actualización:</strong> ${updateDescription}</p>
          <p><strong>Actualizado por:</strong> ${updatedBy}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://softwarepar.lat/client/projects" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Proyecto</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateNewMessageEmailHTML(senderName: string, projectName: string, message: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Nuevo Mensaje</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0;">💬 Nuevo Mensaje</h1>
      </div>
      <div style="padding: 30px 0;">
        <h2>Tienes un nuevo mensaje</h2>
        <div style="background: #faf5ff; border-left: 4px solid #7c3aed; padding: 15px; margin: 20px 0;">
          <p><strong>De:</strong> ${senderName}</p>
          <p><strong>Proyecto:</strong> ${projectName}</p>
          <p><strong>Mensaje:</strong></p>
          <div style="background: white; padding: 10px; border-radius: 5px; margin-top: 10px;">
            ${message}
          </div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://softwarepar.lat/client/projects" style="background: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Responder</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateTicketCreatedEmailHTML(clientName: string, ticketTitle: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Nuevo Ticket</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0;">🎫 Nuevo Ticket de Soporte</h1>
      </div>
      <div style="padding: 30px 0;">
        <h2>¡Nueva solicitud de soporte!</h2>
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
          <p><strong>Cliente:</strong> ${clientName}</p>
          <p><strong>Título:</strong> ${ticketTitle}</p>
        </div>
        <p>Por favor revisa y responde al ticket lo antes posible.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://softwarepar.lat/admin/support" style="background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Ticket</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateTicketResponseEmailHTML(responderName: string, ticketTitle: string, response: string, isFromSupport: boolean) {
  const color = isFromSupport ? '#059669' : '#1e40af';
  const title = isFromSupport ? 'Respuesta de Soporte' : 'Nueva Respuesta';
  
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>${title}</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0;">📞 ${title}</h1>
      </div>
      <div style="padding: 30px 0;">
        <h2>Respuesta a tu ticket</h2>
        <div style="background: #f8fafc; border-left: 4px solid ${color}; padding: 15px; margin: 20px 0;">
          <p><strong>De:</strong> ${responderName}</p>
          <p><strong>Ticket:</strong> ${ticketTitle}</p>
          <p><strong>Respuesta:</strong></p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin-top: 10px;">
            ${response}
          </div>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://softwarepar.lat/client/support" style="background: ${color}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Ver Ticket</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generatePaymentStageEmailHTML(projectName: string, stageName: string, amount: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Pago Disponible</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0;">💰 Pago Disponible</h1>
        <p style="margin: 10px 0 0 0; font-size: 24px;">$${amount}</p>
      </div>
      <div style="padding: 30px 0;">
        <h2>¡Tu proyecto ha avanzado!</h2>
        <p>Una nueva etapa de pago está disponible para tu proyecto:</p>
        <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
          <p><strong>Proyecto:</strong> ${projectName}</p>
          <p><strong>Etapa:</strong> ${stageName}</p>
          <p><strong>Monto:</strong> $${amount}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://softwarepar.lat/client/projects" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Realizar Pago</a>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateBudgetNegotiationEmailHTML(projectName: string, proposedPrice: string, message: string, isCounterOffer: boolean) {
  const title = isCounterOffer ? 'Contraoferta Recibida' : 'Nueva Negociación de Presupuesto';
  
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>${title}</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="margin: 0;">💵 ${title}</h1>
        <p style="margin: 10px 0 0 0; font-size: 24px;">$${proposedPrice}</p>
      </div>
      <div style="padding: 30px 0;">
        <h2>Nueva propuesta de presupuesto</h2>
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
          <p><strong>Proyecto:</strong> ${projectName}</p>
          <p><strong>Precio propuesto:</strong> $${proposedPrice}</p>
          ${message ? `<p><strong>Mensaje:</strong></p><div style="background: white; padding: 10px; border-radius: 5px; margin-top: 10px;">${message}</div>` : ''}
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://softwarepar.lat/client/projects" style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Revisar Propuesta</a>
        </div>
      </div>
    </body>
    </html>
  `;
}
