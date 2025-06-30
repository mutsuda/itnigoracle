import 'dotenv/config';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { fileURLToPath } from 'url';

// Configuración para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Almacén temporal de conversaciones (en producción usar Redis/Database)
const conversations = new Map();

// Almacén para datos del portfolio
let portfolioData = [];

// Contexto sobre itnig para la IA
const ITNIG_CONTEXT = `
itnig es un ecosistema integral de startups fundado en Barcelona en 2010. Aquí tienes la historia completa y evolución:

**Fundación y Primeros Años (2010-2012):**
- Octubre 2010: Bernat Farrero (ingeniero informático) junto a Roger Campos funda Itnig como consultora de desarrollo web en la Universitat Politècnica de Catalunya, iniciando actividades "literalmente en un garaje" familiar en Barcelona. Se dedicó a crear proyectos tecnológicos para terceros.
- 2011: Surge el primer proyecto propio. Tras colaborar con Pere Rius, Itnig co-funda Camaloon como plataforma de impresión bajo demanda de merchandising personalizado. En sus primeros meses logra €130.000 en ventas.
- Febrero 2012: Camaloon expande con Pandalize, portal para artistas noveles. Itnig ya cuenta con 15 empleados y ha atraído €200.000 de inversión business angel.
- Mayo 2012: Itnig evoluciona hacia un modelo de aceleradora de startups ("the hacker accelerator"). Comienza incubando proyectos externos, empezando con Playfulbet (plataforma social de apuestas deportivas). En 3 meses, Playfulbet alcanza 1.000 usuarios en 22 días.

**Crecimiento como Venture Builder (2013-2019):**
- Enero 2013: Playfulbet gana el certamen First Tuesday de startups en España tras superar los 10.000 usuarios.
- Julio 2013: Itnig funda Quipu, solución SaaS de facturación y gestión contable en la nube, liderado por Roger Dobaño y Albert Bellonch.
- 2014-2015: Se lanzan GymForLess (marketplace de gimnasios) y Parkimeter (reserva de parkings).
- Octubre 2016: Se funda Factorial (software de RRHH) desde Itnig, co-creada por Bernat Farrero, Jordi Romero y Pau Ramon.
- Febrero 2018: Primer gran exit - GymForLess es adquirida por Sodexo.
- Agosto 2018: Playfulbet es vendida al grupo Exogroup, alcanzando cerca de 1 millón de usuarios.
- Abril 2018: Itnig apuesta por el Real Estate, adquiriendo una planta adicional de oficinas (~600 m²) en el 22@ (Poblenou, Barcelona).
- Septiembre 2019: Inaugura "Itnig Coffice" en Carrer Pujades 100, 900 m² con oficinas compartidas, salas de eventos y cafetería.

**Evolución hacia Inversión (2020-presente):**
- 2020: Itnig pivota hacia la inversión en startups de terceros. Lanza Itnig Future One, fondo seed de €2,5 millones para fases pre-seed/seed.
- Enero 2021: Parkimeter es adquirida por EasyPark, tercer exit notable.
- Marzo 2021: Itnig Podcast alcanza su episodio #200+.
- 2022: Factorial cierra ronda Serie B de $80M liderada por Tiger Global, convirtiéndose en unicornio español.
- Abril 2023: Abre "Entrepreneur", restaurante-cafetería en Calle Pujades 85.
- Septiembre 2024: Lanza Itnig Capital, fondo de venture capital formal aprobado por la CNMV con €15 millones, enfocado en startups tecnológicas pre-seed/seed en España/Europa.

**Modelo Actual (2025):**
A 15 años de su origen, Itnig se configura como un ecosistema integral que abarca:
- Fábrica de empresas (12 startups propias, 3 vendidas exitosamente)
- Fondo de inversión (Itnig Capital)
- Espacios de coworking y eventos
- Medios de difusión (podcast, eventos)
- Restaurante propio

Los fundadores continúan al frente, con Bernat Farrero como CEO de Itnig y CRO de Factorial, reinvirtiendo en nuevas generaciones de emprendedores.

**Empresas Destacadas del Portfolio:**
- Camaloon: Plataforma de merchandising personalizado
- Quipu: Software de facturación y gestión contable
- Factorial: Software de RRHH (unicornio)
- Parkimeter: Reserva de parkings (vendida a EasyPark)
- Playfulbet: Apuestas deportivas (vendida a Exogroup)
- GymForLess: Marketplace de gimnasios (vendida a Sodexo)

**Espacios Físicos:**
- Oficinas en el distrito 22@ de Poblenou, Barcelona
- Itnig Coffice: Coworking y eventos en Carrer Pujades 100
- Restaurante Entrepreneur en Calle Pujades 85
- Espacios de coworking disponibles para alquiler

**Podcast:**
- Itnig Podcast: Charlas honestas sobre emprendimiento, tecnología y negocio
- Conducido por Bernat Farrero y Jordi Romero
- Más de 200 episodios
- Compartiendo aprendizajes en tiempo real con fundadores e inversores
`;

// Función para parsear el CSV del portfolio
function parsePortfolioCSV() {
  return new Promise((resolve, reject) => {
    const results = [];
    const csvPath = path.join(process.cwd(), 'portfolio.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('CSV del portfolio no encontrado, usando datos vacíos');
      resolve([]);
      return;
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => {
        // Limpiar y estructurar los datos
        const company = {
          name: data.Name || '',
          visibility: data.visibility || '',
          founders: data.founders || '',
          shortDescription: data.short_description_en || '',
          longDescription: data.long_description_en || '',
          twitter: data.Twitter || '',
          linkedin: data.Linkedin || '',
          website: data.Website || '',
          founded: data.Founded || '',
          exit: data.Exit || '',
          focus: data.focus || '',
          status: data.status || '',
          vehicle: data.vehicle || '',
          quote: data.quote || '',
          quoteBy: data.quote_by || ''
        };
        
        // Solo incluir empresas con datos significativos
        if (company.name && company.name.trim()) {
          results.push(company);
        }
      })
      .on('end', () => {
        console.log(`Cargadas ${results.length} empresas del CSV del portfolio`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error('Error parseando CSV:', error);
        reject(error);
      });
  });
}

// Función para inicializar datos del portfolio
async function initializePortfolio() {
  try {
    console.log('Inicializando datos del portfolio...', new Date().toISOString());
    const csvPath = path.join(process.cwd(), 'portfolio.csv');
    console.log('Ruta del CSV:', csvPath);
    console.log('¿Existe el archivo?', fs.existsSync(csvPath));
    
    portfolioData = await parsePortfolioCSV();
    console.log(`Datos del portfolio cargados: ${portfolioData.length} empresas`);
    
    if (portfolioData.length > 0) {
      console.log('Primera empresa:', portfolioData[0].name);
      console.log('Última empresa:', portfolioData[portfolioData.length - 1].name);
      console.log('Portfolio inicializado con datos completos.');
    } else {
      console.log('No se cargaron empresas del portfolio');
    }
  } catch (error) {
    console.error('Error inicializando portfolio:', error);
  }
}

// Inicializar portfolio al arrancar - Timestamp: 2025-01-27
initializePortfolio();

// Función para clasificar la pregunta
async function classifyQuestion(question, conversationHistory = []) {
  const contextPrompt = conversationHistory.length > 0 
    ? `Contexto de la conversación anterior: ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\n`
    : '';

  // Lista de empresas del portfolio para ayudar en la clasificación
  const portfolioCompanies = portfolioData.map(company => company.name.toLowerCase());
  
  const prompt = `
${ITNIG_CONTEXT}

${contextPrompt}

Empresas del portfolio de itnig: ${portfolioCompanies.join(', ')}

Clasifica la siguiente pregunta en una de estas categorías:
- "podcast": Preguntas sobre el podcast, entrevistas, invitados, episodios
- "investment": Preguntas sobre el fondo de inversión, portfolio, participadas, inversiones, empresas específicas del portfolio
- "real_estate": Preguntas sobre coworking, restaurante, espacios físicos
- "general": Preguntas generales sobre itnig

IMPORTANTE: Si la pregunta menciona una empresa específica del portfolio (como Latitude, Syra, Factorial, etc.), clasifícala como "investment".

Pregunta: "${question}"

Responde solo con una de estas palabras: podcast, investment, real_estate, general
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 10,
      temperature: 0.1,
    });

    const classification = completion.choices[0].message.content.trim().toLowerCase();
    return classification;
  } catch (error) {
    console.error('Error en clasificación:', error);
    return 'general'; // Fallback
  }
}

// Agente de Podcast
async function handlePodcastQuestion(question, conversationHistory = []) {
  try {
    const response = await fetch('https://itnig-search-api-555158784456.europe-southwest1.run.app/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text: question,
        num_results: 3
      }),
    });

    if (!response.ok) {
      throw new Error(`Error en la API del podcast: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('🔍 Datos recibidos de la API del podcast:', JSON.stringify(data, null, 2));
    
    if (data && data.length > 0) {
      // Extraer el video_id de la URL para generar el thumbnail
      const podcasts = data.map(clip => {
        let videoId = null;
        // Extraer videoId de cualquier formato de YouTube
        // 1. youtu.be/VIDEO_ID
        // 2. youtube.com/watch?v=VIDEO_ID
        // 3. youtube.com/embed/VIDEO_ID
        // 4. youtube.com/v/VIDEO_ID
        // 5. youtube.com/shorts/VIDEO_ID
        const patterns = [
          /youtu\.be\/([\w-]{11})/, // youtu.be/VIDEO_ID
          /[?&]v=([\w-]{11})/,      // v=VIDEO_ID
          /embed\/([\w-]{11})/,    // embed/VIDEO_ID
          /\/v\/([\w-]{11})/,      // /v/VIDEO_ID
          /shorts\/([\w-]{11})/    // shorts/VIDEO_ID
        ];
        for (const pattern of patterns) {
          const match = clip.video_url.match(pattern);
          if (match) {
            videoId = match[1];
            break;
          }
        }
        // Si no se pudo extraer, intentar extraer el primer grupo de 11 caracteres tras la última barra
        if (!videoId) {
          const fallback = clip.video_url.match(/\/([\w-]{11})(?:[?&]|$)/);
          if (fallback) videoId = fallback[1];
        }
        return {
          title: clip.title,
          description: clip.text,
          video_url: clip.video_url,
          thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://img.youtube.com/vi/default/hqdefault.jpg',
          start: clip.start || 0
        };
      });
      
      // Devolver respuesta estructurada
      return {
        type: 'podcast',
        response: `He encontrado información relevante en el podcast de itnig:`,
        podcasts: podcasts
      };
    } else {
      return {
        type: 'podcast',
        response: 'No encontré clips específicos sobre tu pregunta en el podcast de itnig.',
        podcasts: []
      };
    }
  } catch (error) {
    console.error('Error en agente podcast:', error);
    return {
      type: 'podcast',
      response: 'Lo siento, no puedo acceder a la información del podcast en este momento.',
      podcasts: []
    };
  }
}

// Agente de Investment con portfolio completo como contexto
async function handleInvestmentQuestion(question, conversationHistory) {
  try {
    // Detectar si es una pregunta sobre aplicar al fondo
    const applyKeywords = [
      'aplicar', 'aplicar al fondo', 'invertir en mi proyecto', 'invertir en mi startup',
      'cómo aplicar', 'cómo puedo aplicar', 'quiero que inviertan', 'solicitar inversión',
      'formulario', 'proceso de inversión', 'criterios de inversión', 'contactar para inversión',
      'presentar proyecto', 'enviar proyecto', 'evaluar mi startup', 'considerar mi empresa'
    ];
    
    const isApplyQuestion = applyKeywords.some(keyword => 
      question.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (isApplyQuestion) {
      return `Para aplicar al fondo de inversión de itnig: **itnig.net/fund**`;
    }
    
    // Crear contexto con todo el portfolio (solo información procesada)
    let portfolioContext = '';
    if (portfolioData.length > 0) {
      portfolioContext = '\n\nPortfolio de empresas de itnig:\n';
      portfolioData.forEach((company, index) => {
        portfolioContext += `\n${index + 1}. **${company.name}**
- Fundadores: ${company.founders || 'No especificado'}
- Descripción: ${company.shortDescription || company.longDescription || 'No disponible'}
- Sector: ${company.focus || 'No especificado'}
- Estado: ${company.status || 'No especificado'}
- Vehículo: ${company.vehicle || 'No especificado'}
- Website: ${company.website || 'No disponible'}
- Fundada: ${company.founded || 'No especificado'}
- Exit: ${company.exit || 'No aplica'}\n`;
      });
    }
    
    const context = `Eres un asesor de inversiones experto en el portfolio de itnig. 

IMPORTANTE: Solo puedes mencionar empresas que estén en la información del portfolio que te proporciono. NO inventes ni menciones empresas que no aparezcan en los datos.

${conversationHistory ? `Historial de la conversación:\n${conversationHistory}\n` : ''}

Pregunta: "${question}"${portfolioContext}

Responde de manera concisa y directa. Si no tienes información sobre algo, di simplemente "No tengo información sobre eso" sin añadir explicaciones innecesarias.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un asesor de inversiones experto en el portfolio de itnig. Responde de manera concisa y directa. Si no tienes información sobre algo, di simplemente 'No tengo información sobre eso'."
        },
        {
          role: "user",
          content: context
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI for investment question:', error);
    return "Lo siento, estoy teniendo problemas para procesar tu pregunta sobre inversiones. ¿Podrías intentarlo de nuevo?";
  }
}

// Agente de Real Estate
async function handleRealEstateQuestion(question, conversationHistory = []) {
  const contextPrompt = conversationHistory.length > 0 
    ? `Contexto de la conversación anterior: ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\n`
    : '';

  const prompt = `
${ITNIG_CONTEXT}

${contextPrompt}

Responde a la siguiente pregunta sobre los espacios físicos de itnig de manera concisa y directa:

Pregunta: "${question}"

Información específica sobre real estate de itnig:

**Espacios de Trabajo:**
- Mucho espacio disponible para alquilar
- Oficinas cerradas para equipos
- Espacios abiertos para coworking
- Flexibilidad para equipos grandes o pequeños
- Amplio coworking disponible

**Restauración:**
- Restaurante "Entrepreneur" en las instalaciones
- Cafetería de itnig

**Espacios de Eventos y Reuniones:**
- Sala de eventos disponible
- Salas de reuniones para alquilar
- Espacios para networking y eventos

**Información de Contacto:**
- Para más información sobre coworking: itnig.net/coworking

Responde de manera concisa. Si no tienes información sobre algo, di simplemente "No tengo información sobre eso".`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error en agente real estate:', error);
    return 'Lo siento, no puedo responder sobre los espacios físicos en este momento.';
  }
}

// Agente General
async function handleGeneralQuestion(question, conversationHistory = []) {
  const contextPrompt = conversationHistory.length > 0 
    ? `Contexto de la conversación anterior: ${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\n`
    : '';

  const prompt = `
${ITNIG_CONTEXT}

${contextPrompt}

Responde a la siguiente pregunta general sobre itnig de manera concisa y directa:

Pregunta: "${question}"

Responde de manera concisa. Si no tienes información sobre algo, di simplemente "No tengo información sobre eso".`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error en agente general:', error);
    return 'Lo siento, no puedo responder en este momento.';
  }
}

// Función para limpiar conversaciones antiguas (cada 30 minutos)
function cleanupOldConversations() {
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000);
  for (const [conversationId, conversation] of conversations.entries()) {
    if (conversation.lastActivity < thirtyMinutesAgo) {
      conversations.delete(conversationId);
    }
  }
}

// Endpoint principal (Serverless Function Node.js)
export default async function handler(req, res) {
  // Configurar CORS de manera más completa
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { question, conversationId } = req.body;

    // Validar entrada
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ 
        error: 'Se requiere un campo "question" de tipo string' 
      });
    }

    // Limpiar conversaciones antiguas
    cleanupOldConversations();

    // Obtener o crear conversación
    let conversation = conversations.get(conversationId);
    if (!conversation) {
      conversation = {
        messages: [],
        lastActivity: Date.now()
      };
      if (conversationId) {
        conversations.set(conversationId, conversation);
      }
    } else {
      conversation.lastActivity = Date.now();
    }

    // Clasificar la pregunta con contexto
    const classification = await classifyQuestion(question, conversation.messages);
    console.log(`Pregunta clasificada como: ${classification}`);

    // Enrutar a la agente correspondiente con contexto
    let response;
    let responseData = {};
    
    switch (classification) {
      case 'podcast':
        responseData = await handlePodcastQuestion(question, conversation.messages);
        response = responseData.response;
        break;
      case 'investment':
        response = await handleInvestmentQuestion(question, conversation.messages);
        break;
      case 'real_estate':
        response = await handleRealEstateQuestion(question, conversation.messages);
        break;
      case 'general':
      default:
        response = await handleGeneralQuestion(question, conversation.messages);
        break;
    }

    // Actualizar historial de conversación
    conversation.messages.push(
      { role: 'user', content: question },
      { role: 'assistant', content: response }
    );

    // Limitar el historial a los últimos 10 mensajes para evitar tokens excesivos
    if (conversation.messages.length > 10) {
      conversation.messages = conversation.messages.slice(-10);
    }

    // Preparar respuesta final
    const finalResponse = {
      response,
      classification,
      question,
      conversationId: conversationId || null,
      messageCount: conversation.messages.length
    };

    // Si es una respuesta de podcast, incluir los datos estructurados
    if (classification === 'podcast' && responseData.podcasts) {
      finalResponse.podcasts = responseData.podcasts;
    }

    // Devolver respuesta
    return res.status(200).json(finalResponse);

  } catch (error) {
    console.error('Error en el endpoint:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
}

export { handler }; 