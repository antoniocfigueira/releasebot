import cors from 'cors';
import express from 'express';
import aiRoutes from './src/routes/aiRoutes.js';
import { testConnection } from './src/services/db.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', aiRoutes);

app.get('/health', async (req, res) => {
  const database = await testConnection();

  res.json({
    success: true,
    message: 'ReleaseBOT API',
    database
  });
});

app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(500).json({
    success: false,
    error: error.message
  });
});

export default app;
