
// Script para probar el sistema de WhatsApp
// Ejecutar con: node test_whatsapp.js

const { sendWhatsAppMessage, whatsappTemplates } = require('./server/whatsapp');

async function testWhatsApp() {
  try {
    console.log('🧪 Testing sistema de WhatsApp...');
    
    // Test básico de envío
    const testMessage = whatsappTemplates.paymentReminder(
      'Juan Carlos',
      'Entrega Final',
      '250.00',
      'https://softwarepar.lat/client/projects'
    );
    
    console.log('📱 Mensaje a enviar:', testMessage);
    
    // Reemplaza con un número real para testing
    const testPhone = '+595981234567';
    
    const result = await sendWhatsAppMessage({
      to: testPhone,
      message: testMessage,
    });
    
    console.log('✅ Test exitoso:', result.sid);
  } catch (error) {
    console.error('❌ Test falló:', error);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  testWhatsApp();
}
