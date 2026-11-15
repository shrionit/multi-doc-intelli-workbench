import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import documentRoutes from './routes/document.routes';
import analysisRoutes from './routes/analysis.routes';
import { errorHandler } from './middleware/error.middleware';
import { getLLMProvider } from './llm/llm.factory';

const app = express();

// ── Middleware ──
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json({ limit: '10mb' }));

// ── Routes ──
app.use('/api/documents', documentRoutes);
app.use('/api/analysis', analysisRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', provider: getLLMProvider().name });
});

// ── Error handler (must be last) ──
app.use(errorHandler);

// ── Start ──
app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📄 LLM Provider: ${getLLMProvider().name}`);
});

export default app;
