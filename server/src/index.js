import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateQuizController } from './controllers/quizController.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) for frontend client
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);

// Built-in middleware to parse incoming JSON request bodies
app.use(express.json());

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'AI Study Quiz backend is running healthy',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Expected Target Quiz Response Structure (Contract for upcoming steps):
 *
 * {
 *   "title": "JavaScript Closures",
 *   "questions": [
 *     {
 *       "id": "q1",
 *       "question": "What is a closure?",
 *       "options": [
 *         { "id": "a", "text": "..." },
 *         { "id": "b", "text": "..." },
 *         { "id": "c", "text": "..." },
 *         { "id": "d", "text": "..." }
 *       ],
 *       "correctAnswer": "a",
 *       "explanation": "..."
 *     }
 *   ]
 * }
 *
 * Rules:
 * - title: non-empty string
 * - questions: exactly 5 questions
 * - each question has id, question, options, correctAnswer, explanation
 * - exactly 4 options per question
 * - each option has id and text
 * - option IDs must be unique within a question
 * - correctAnswer must match one option ID
 * - explanation must be a non-empty string
 */

// Quiz generation endpoint
app.post('/api/generate-quiz', generateQuizController);

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
