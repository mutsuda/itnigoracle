# 🚀 Backend de IA para itnig

Backend inteligente con agentes especializados para responder preguntas sobre itnig usando Vercel Edge Functions y OpenAI. **¡Ahora con sistema RAG dinámico para el portfolio y soporte para conversaciones con contexto!**

## 🎯 Características

- **Endpoint único**: `POST /api/query`
- **Clasificación automática** de preguntas usando IA
- **🆕 Sistema RAG dinámico** - Procesa automáticamente el CSV del portfolio
- **🆕 Conversaciones con contexto** - Mantiene memoria de la conversación
- **💰 Portfolio dinámico** - Se actualiza automáticamente desde el CSV
- **4 agentes especializados**:
  - 🎙️ **Podcast**: Usa API existente para preguntas sobre el podcast
  - 💰 **Investment**: Preguntas sobre fondo, portfolio, participadas (con RAG dinámico)
  - 🏢 **Real Estate**: Preguntas sobre coworking, restaurante, espacios
  - ℹ️ **General**: Preguntas generales sobre itnig

## 🔧 Sistema RAG (Retrieval-Augmented Generation)

### ¿Qué es RAG?
El sistema RAG permite que la IA acceda dinámicamente a la información del portfolio sin necesidad de hardcodear datos. 

### ¿Cómo funciona?
1. **Lectura automática**: Lee el archivo `portfolio.csv` al iniciar
2. **Creación de embeddings**: Genera representaciones vectoriales de cada empresa
3. **Búsqueda semántica**: Cuando preguntas, encuentra las empresas más relevantes
4. **Respuestas contextuales**: Usa la información encontrada para responder

### Ventajas del RAG vs datos hardcodeados
- ✅ **Siempre actualizado**: Solo actualiza el CSV
- ✅ **Escalable**: No necesita cambios de código para nuevas empresas
- ✅ **Preciso**: Usa datos reales del portfolio
- ✅ **Flexible**: Puede responder consultas complejas
- ✅ **Mantenible**: Una sola fuente de verdad (archivo CSV)

## 📊 Estructura del Portfolio

El sistema procesa automáticamente un archivo `portfolio.csv` con esta estructura:

```csv
Name,visibility,founders,short_description_en,long_description_en,Twitter,Linkedin,Website,Founded,Exit,focus,status,vehicle,quote,quote_by
```

**Campos principales:**
- `Name`: Nombre de la empresa
- `founders`: Fundadores
- `short_description_en`: Descripción breve
- `long_description_en`: Descripción detallada
- `focus`: Sector/industria
- `status`: active/exit/owned
- `vehicle`: Vehículo de inversión (IFO1, IFO2, etc.)
- `Founded`: Año de fundación
- `Exit`: Año de salida (si aplica)

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd itnig-ai-backend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crear un archivo `.env.local`:
```env
OPENAI_API_KEY=tu_api_key_de_openai
```

### 4. Añadir datos del portfolio
```bash
# Coloca tu archivo portfolio.csv en el directorio raíz
cp tu_portfolio.csv portfolio.csv
```

### 5. Desplegar en Vercel
```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Desplegar
vercel --prod
```

## 📡 Uso de la API

### Endpoint
```
POST /api/query
```

### Formato de entrada

#### Pregunta individual (sin contexto)
```json
{
  "question": "¿Qué es itnig?"
}
```

#### Pregunta con conversación (con contexto)
```json
{
  "question": "¿Cuánto invierte?",
  "conversationId": "mi-conversacion-123"
}
```

### Formato de salida
```json
{
  "response": "itnig es un hub de innovación en Barcelona que...",
  "classification": "general",
  "question": "¿Qué es itnig?",
  "conversationId": "mi-conversacion-123",
  "messageCount": 4
}
```

## 🗣️ Conversaciones con Contexto

### ¿Cómo funciona?

1. **Primera pregunta**: Envía `conversationId` para iniciar una conversación
2. **Preguntas siguientes**: Usa el mismo `conversationId` para mantener contexto
3. **Memoria automática**: La IA recuerda hasta 10 mensajes de la conversación
4. **Limpieza automática**: Las conversaciones se borran después de 30 minutos de inactividad

### Ejemplo de conversación

```bash
# Mensaje 1: Iniciar conversación
curl -X POST https://tu-dominio.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "¿Qué es itnig?",
    "conversationId": "conv-001"
  }'

# Respuesta: "itnig es un hub de innovación en Barcelona..."

# Mensaje 2: Seguir conversación
curl -X POST https://tu-dominio.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "¿Cuánto invierte el fondo?",
    "conversationId": "conv-001"
  }'

# Respuesta: "El fondo de itnig invierte en startups tecnológicas..." (recuerda que hablábamos de itnig)

# Mensaje 3: Más contexto
curl -X POST https://tu-dominio.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "¿Y en qué empresas han invertido?",
    "conversationId": "conv-001"
  }'

# Respuesta: "itnig ha invertido en empresas como Factorial, Holded, Typeform..." (mantiene contexto completo)
```

## 🧪 Ejemplos de uso

### Ejemplo 1: Pregunta individual
```bash
curl -X POST https://tu-dominio.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "¿Qué es itnig?"}'
```

### Ejemplo 2: Conversación sobre portfolio
```bash
# Iniciar conversación
curl -X POST https://tu-dominio.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Háblame de Factorial",
    "conversationId": "portfolio-chat"
  }'

# Seguir conversación
curl -X POST https://tu-dominio.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "¿En qué otros sectores invierten?",
    "conversationId": "portfolio-chat"
  }'
```

### Ejemplo 3: Conversación sobre podcast
```bash
# Iniciar conversación
curl -X POST https://tu-dominio.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "¿Tienen podcast?",
    "conversationId": "podcast-chat"
  }'

# Seguir conversación
curl -X POST https://tu-dominio.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "¿Quién ha sido el último invitado?",
    "conversationId": "podcast-chat"
  }'
```

## 🔄 Actualizar Datos del Portfolio

Para añadir nuevas empresas o actualizar información existente:

1. **Actualizar el archivo CSV**
```bash
# Editar portfolio.csv con nuevos datos
nano portfolio.csv
```

2. **Redesplegar** (si usas Vercel)
```bash
vercel --prod
```

El sistema automáticamente:
- Procesa el CSV actualizado
- Crea nuevos embeddings
- Hace la información disponible para consultas

## 🧪 Testing

### Probar el sistema RAG
```bash
node test-rag.js
```

Esto probará varias consultas contra los datos del portfolio para asegurar que el sistema RAG funciona correctamente.

### Probar la API
```bash
curl -X POST https://tu-dominio.vercel.app/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "¿En qué empresas invierte itnig?"}'
```

## 📝 Ejemplos de Consultas

### Portfolio de Inversiones
- "Háblame de Factorial"
- "¿Qué empresas fintech están en el portfolio?"
- "¿Quiénes son los fundadores de Payflow?"
- "¿Cuál es la estrategia de inversión de itnig?"
- "Muéstrame empresas exitadas"

### Podcast
- "Háblame del podcast de itnig"
- "¿Qué temas cubre el podcast?"
- "¿Quiénes son los invitados del podcast?"

### General
- "¿Qué es itnig?"
- "¿Dónde está ubicado itnig?"
- "¿Qué hace itnig?"

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Consulta      │───▶│  Clasificación  │───▶│  Búsqueda RAG   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Respuesta      │◀───│  Generación IA  │◀───│  Datos Portfolio│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Configuración

### Variables de Entorno
- `OPENAI_API_KEY`: Tu API key de OpenAI (requerido)

### Configuración CSV
- El archivo debe llamarse `portfolio.csv`
- Debe estar en el directorio raíz
- Debe tener los headers de columnas esperados

## 📈 Rendimiento

- **Inicialización**: ~2-3 segundos para cargar y embeber datos del portfolio
- **Respuesta de consulta**: ~1-2 segundos para consultas típicas
- **Uso de memoria**: ~50-100MB dependiendo del tamaño del portfolio
- **Escalabilidad**: Soporta portfolios con cientos de empresas

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama de feature
3. Haz tus cambios
4. Prueba con `node test-rag.js`
5. Envía un pull request

## 📄 Licencia

MIT License - ver archivo LICENSE para detalles

## 🆘 Soporte

Para problemas o preguntas:
1. Revisa los logs en el dashboard de Vercel
2. Verifica el formato de tu archivo CSV
3. Asegúrate de que tu API key de OpenAI sea válida
4. Prueba con el script de test proporcionado

---

**Construido con ❤️ para itnig** 