import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { prisma } from './services/prisma';
import { initAdmin } from './controllers/auth';

import authRoutes from './routes/auth';
import sitesRoutes from './routes/sites';
import eventsRoutes from './routes/events';
import statsRoutes from './routes/stats';
import sdkRoutes from './routes/sdk';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SDK scripts (public)
app.use('/', sdkRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((_, res) => {
  res.status(404).json({ error: 'Not found' });
});

async function main() {
  await prisma.$connect();
  console.log('Database connected');

  await initAdmin();

  app.listen(PORT, () => {
    console.log(`Analytics server running on port ${PORT}`);
  });
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
