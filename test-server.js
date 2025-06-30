import express from 'express';
import cors from 'cors';
import { handler } from './api/query.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Wrapper para convertir el handler de Vercel a Express
app.post('/api/query', async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('Error en handler:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de prueba corriendo en http://localhost:${PORT}`);
  console.log('📝 Endpoint: POST /api/query');
}); 