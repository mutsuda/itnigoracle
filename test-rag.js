import 'dotenv/config';
import { handler } from './api/query.js';

async function testRAG() {
  console.log('🧪 Probando Sistema RAG para Portfolio de itnig...\n');

  const testQueries = [
    "Háblame de Factorial",
    "¿En qué empresas invierte itnig?",
    "Muéstrame empresas fintech del portfolio",
    "¿Quiénes son los fundadores de Payflow?",
    "¿Cuál es la estrategia de inversión de itnig?",
    "Háblame de empresas exitadas",
    "¿En qué sectores se enfoca itnig?",
    "Háblame de Kubbo logística"
  ];

  for (const query of testQueries) {
    console.log(`\n📝 Consulta: "${query}"`);
    console.log('─'.repeat(50));
    
    try {
      // Simular una request HTTP
      const mockReq = {
        method: 'POST',
        body: { question: query }
      };
      
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            console.log(`🎯 Categoría: ${data.classification}`);
            console.log(`💬 Respuesta: ${data.response.substring(0, 200)}...`);
            return mockRes;
          }
        }),
        setHeader: () => mockRes,
        end: () => mockRes
      };

      await handler(mockReq, mockRes);
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
    
    console.log('');
  }
}

// Ejecutar el test
testRAG().catch(console.error); 