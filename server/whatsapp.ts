
import twilio from 'twilio';
import { db } from './db';
import { twilioConfig } from '@shared/schema';

let twilioClient: any = null;
let currentConfig: any = null;

// Función para cargar configuración de Twilio desde la base de datos
export async function loadTwilioConfig() {
  try {
    const configs = await db.select().from(twilioConfig).limit(1);
    
    if (configs.length > 0) {
      currentConfig = configs[0];
      
      if (currentConfig.accountSid && currentConfig.authToken) {
        twilioClient = twilio(currentConfig.accountSid, currentConfig.authToken);
        console.log('✅ Twilio configurado correctamente desde BD');
        return currentConfig;
      }
    }
    
    console.log('⚠️ Twilio no configurado en la base de datos');
    return null;
  } catch (error) {
    console.error('❌ Error cargando configuración de Twilio:', error);
    return null;
  }
}

// Función para obtener configuración actual
export async function getTwilioConfig() {
  const configs = await db.select().from(twilioConfig).limit(1);
  return configs.length > 0 ? configs[0] : null;
}

// Función para actualizar configuración
export async function updateTwilioConfig(config: {
  accountSid?: string;
  authToken?: string;
  whatsappNumber?: string;
  isProduction?: boolean;
}) {
  try {
    const configs = await db.select().from(twilioConfig).limit(1);
    
    if (configs.length > 0) {
      // Actualizar configuración existente
      await db.update(twilioConfig)
        .set({
          ...config,
          updatedAt: new Date(),
        })
        .where(eq(twilioConfig.id, configs[0].id));
    } else {
      // Crear nueva configuración
      await db.insert(twilioConfig).values({
        accountSid: config.accountSid || '',
        authToken: config.authToken || '',
        whatsappNumber: config.whatsappNumber || '',
        isProduction: config.isProduction || false,
      });
    }

    // Recargar cliente de Twilio
    await loadTwilioConfig();
    
    return true;
  } catch (error) {
    console.error('❌ Error actualizando configuración de Twilio:', error);
    throw error;
  }
}

export interface WhatsAppMessage {
  to: string; // Número de teléfono con código de país (+595...)
  message: string;
  mediaUrl?: string; // Para imágenes o documentos
}

export async function sendWhatsAppMessage({ to, message, mediaUrl }: WhatsAppMessage) {
  // Asegurar que tenemos la configuración más reciente
  if (!twilioClient || !currentConfig) {
    await loadTwilioConfig();
  }

  if (!twilioClient || !currentConfig?.whatsappNumber) {
    console.error('❌ Twilio no configurado. Verifica la configuración en el dashboard de admin.');
    throw new Error('WhatsApp no configurado');
  }

  try {
    console.log(`📱 Enviando WhatsApp a ${to}:`, message);

    const messageData: any = {
      from: `whatsapp:${currentConfig.whatsappNumber}`,
      to: `whatsapp:${to}`,
      body: message,
    };

    if (mediaUrl) {
      messageData.mediaUrl = [mediaUrl];
    }

    const result = await twilioClient.messages.create(messageData);
    
    console.log(`✅ WhatsApp enviado exitosamente:`, result.sid);
    return result;
  } catch (error) {
    console.error(`❌ Error enviando WhatsApp a ${to}:`, error);
    throw error;
  }
}

// Templates específicos para diferentes tipos de notificaciones
export const whatsappTemplates = {
  newTicketResponse: (userName: string, ticketNumber: string, link: string) => 
    `🎫 Hola ${userName}, tienes una nueva respuesta en tu ticket #${ticketNumber}. Revisa tu panel: ${link}`,

  projectUpdate: (userName: string, projectName: string, link: string) => 
    `📋 Hola ${userName}, el admin envió un mensaje sobre tu proyecto '${projectName}'. Revisa tu panel: ${link}`,

  paymentReminder: (userName: string, stageName: string, amount: string, link: string) => 
    `💰 Recordatorio: ${stageName} de tu proyecto está lista para pago ($${amount}). Continúa aquí: ${link}`,

  projectCreated: (userName: string, projectName: string, link: string) => 
    `🚀 Hola ${userName}, tu proyecto '${projectName}' fue creado exitosamente. Seguimiento: ${link}`,

  newMessage: (userName: string, senderName: string, projectName: string, link: string) => 
    `💬 Hola ${userName}, ${senderName} te envió un mensaje en '${projectName}'. Responder: ${link}`,

  budgetNegotiation: (userName: string, projectName: string, amount: string, isCounter: boolean, link: string) => 
    `💵 Hola ${userName}, ${isCounter ? 'contraoferta' : 'nueva propuesta'} de $${amount} para '${projectName}'. Ver: ${link}`,
};

// Función para obtener número de WhatsApp del usuario
export async function getUserWhatsAppNumber(userId: number): Promise<string | null> {
  try {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user.length > 0 ? user[0].whatsappNumber : null;
  } catch (error) {
    console.error('Error getting user WhatsApp number:', error);
    return null;
  }
}

// Inicializar configuración al importar
loadTwilioConfig();
