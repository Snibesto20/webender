import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import clientRoutes from './routes/clients.js';
import emailRoutes from './routes/email.js';
import userRoutes from './routes/users.js';
import eventRoutes from './routes/events.js';
import { migrateToUsersCollection } from './utils/migrate.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0
    ? (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) cb(null, true);
        else cb(new Error('Not allowed by CORS'));
      }
    : true,
  credentials: true
}));
app.use(express.json({ limit: '100kb' }));

app.use('/api', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/send-email', emailRoutes);
app.use('/api/events', eventRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB database ready!');
    try {
      await migrateToUsersCollection(mongoose);
    } catch (err) {
      console.error('⚠️ Collection migration warning:', err.message);
    }
    app.listen(PORT, () => console.log(`✅ Server ready on port ${PORT}!`));
  } catch (err) {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  }
}

start();
