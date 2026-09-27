import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateQuizController } from './controllers/quizController.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'AI Study Quiz backend is running healthy',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/generate-quiz', generateQuizController);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
