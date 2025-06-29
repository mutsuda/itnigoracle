// Archivo de prueba para el backend de IA de itnig con conversación
// Ejecutar con: node test.js

const API_URL = 'http://localhost:3000/api/query'; // Cambiar por tu URL de producción

// Simular conversación con contexto
const conversationTests = [
  {
    name: "Conversación sobre inversiones",
    conversationId: "conv-001",
    messages: [
      "¿Qué es itnig?",
      "¿Cuánto invierte el fondo?",
      "¿En qué empresas han invertido?",
      "¿Y cuánto invierten por startup?"
    ]
  },
  {
    name: "Conversación sobre espacios",
    conversationId: "conv-002", 
    messages: [
      "¿Dónde está ubicado itnig?",
      "¿Tienen coworking?",
      "¿Y restaurante?",
      "¿Cuánto cuesta el coworking?"
    ]
  },
  {
    name: "Conversación mixta",
    conversationId: "conv-003",
    messages: [
      "¿Qué hace itnig?",
      "¿Tienen podcast?",
      "¿Quién ha sido el último invitado?",
      "¿Y sobre inversiones, cuánto invierten?"
    ]
  }
];

// Preguntas individuales para comparar
const individualQuestions = [
  {
    category: "General",
    question: "¿Qué es itnig?"
  },
  {
    category: "Investment",
    question: "¿Cuánto invierte el fondo?"
  },
  {
    category: "Real Estate",
    question: "¿Dónde está el coworking?"
  }
];

async function testAPI(question, conversationId = null) {
  try {
    const body = conversationId 
      ? { question, conversationId }
      : { question };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return { error: error.message };
  }
}

async function testConversation(conversation) {
  console.log(`\n🗣️  ${conversation.name}`);
  console.log(`🆔 Conversation ID: ${conversation.conversationId}`);
  console.log('='.repeat(60));

  for (let i = 0; i < conversation.messages.length; i++) {
    const question = conversation.messages[i];
    console.log(`\n📝 Mensaje ${i + 1}: ${question}`);
    console.log('-'.repeat(50));
    
    const result = await testAPI(question, conversation.conversationId);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    } else {
      console.log(`✅ Clasificación: ${result.classification}`);
      console.log(`💬 Respuesta: ${result.response}`);
      console.log(`📊 Mensajes en conversación: ${result.messageCount}`);
    }
    
    // Pausa entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testIndividualQuestions() {
  console.log('\n🧪 Preguntas individuales (sin contexto)');
  console.log('='.repeat(60));

  for (const test of individualQuestions) {
    console.log(`\n📝 Pregunta (${test.category}): ${test.question}`);
    console.log('-'.repeat(50));
    
    const result = await testAPI(test.question);
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
    } else {
      console.log(`✅ Clasificación: ${result.classification}`);
      console.log(`💬 Respuesta: ${result.response}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function runTests() {
  console.log('🧪 Probando Backend de IA para itnig con CONVERSACIÓN\n');
  
  // Probar conversaciones con contexto
  for (const conversation of conversationTests) {
    await testConversation(conversation);
  }
  
  // Probar preguntas individuales para comparar
  await testIndividualQuestions();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Pruebas completadas');
  console.log('\n💡 Observa cómo las respuestas en conversación mantienen contexto!');
}

// Ejecutar pruebas
runTests().catch(console.error); 