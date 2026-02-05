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

// Trust proxy (nginx) for correct protocol/host detection
app.set('trust proxy', true);

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Debug IP detection
app.get('/api/debug/ip', (req, res) => {
  const geoip = require('geoip-lite');
  const forwardedFor = req.headers['x-forwarded-for'] as string;
  const realIp = req.headers['x-real-ip'] as string;
  const ip = (forwardedFor?.split(',')[0]?.trim()) || realIp || req.socket.remoteAddress;
  const geo = geoip.lookup(ip);

  res.json({
    headers: {
      'x-forwarded-for': forwardedFor,
      'x-real-ip': realIp,
    },
    socketRemoteAddress: req.socket.remoteAddress,
    resolvedIp: ip,
    geoResult: geo
  });
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
