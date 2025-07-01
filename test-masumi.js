const API_URL = 'https://oracle-c36ec442j-mutsudas-projects-8686629d.vercel.app/api/query';

async function testMasumiQuestions() {
  const questions = [
    "¿Quién es Masumi Mutsuda?",
    "¿Cuál es el rol de Masumi Mutsuda en itnig?",
    "¿Qué hace Masumi Mutsuda?",
    "¿Masumi Mutsuda es actor de doblaje?",
    "¿Cuál es la experiencia de Masumi Mutsuda?",
    "¿Masumi Mutsuda es CTO de itnig?",
    "¿Qué relación tiene Masumi Mutsuda con el podcast de itnig?"
  ];

  console.log('🧪 Probando preguntas sobre Masumi Mutsuda...\n');

  for (const question of questions) {
    try {
      console.log(`❓ Pregunta: ${question}`);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          conversationId: 'test-masumi-' + Date.now()
        })
      });

      const data = await response.json();
      
      console.log(`📝 Respuesta: ${data.response}`);
      console.log(`🏷️  Clasificación: ${data.classification}`);
      console.log('---\n');
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Error en pregunta "${question}":`, error.message);
    }
  }
}

// Run the test
testMasumiQuestions().catch(console.error); 