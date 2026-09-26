import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

// Load environment variables from .env file
dotenv.config();

// Initialize the Groq SDK client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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
// Quiz generation endpoint - calls Groq to get raw model response
app.post('/api/generate-quiz', async (req, res) => {
  const { topic, difficulty } = req.body || {};

  // Validate topic
  if (!topic || typeof topic !== 'string' || topic.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Topic is required and cannot be empty.',
    });
  }

  // Validate difficulty
  const allowedDifficulties = ['easy', 'medium', 'hard'];
  const normalizedDifficulty = typeof difficulty === 'string' ? difficulty.trim().toLowerCase() : '';

  if (!allowedDifficulties.includes(normalizedDifficulty)) {
    return res.status(400).json({
      success: false,
      error: 'Difficulty must be one of: "easy", "medium", or "hard".',
    });
  }

  // Prompt instructing Groq to return ONLY valid JSON matching the quiz contract
  const prompt = `You are a quiz generator. Generate a study quiz about the topic "${topic.trim()}" at ${normalizedDifficulty} difficulty.

Follow these strict requirements:
1. Generate exactly 5 questions.
2. Generate exactly 4 options per question.
3. Each question must have one correct answer.
4. correctAnswer must contain the ID of the correct option.
5. Include an explanation for every question.
6. Return ONLY valid JSON matching this exact structure:
{
  "title": "Topic Title",
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": [
        { "id": "a", "text": "Option A" },
        { "id": "b", "text": "Option B" },
        { "id": "c", "text": "Option C" },
        { "id": "d", "text": "Option D" }
      ],
      "correctAnswer": "a",
      "explanation": "Explanation text here."
    }
  ]
}

Formatting rules:
- Return ONLY JSON.
- Do not use Markdown.
- Do not wrap the JSON in \`\`\`json code fences.
- Do not include any text before or after the JSON.`;

  try {
    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'openai/gpt-oss-20b',
    });

    const rawResponse = chatCompletion.choices[0]?.message?.content || '';

    // Parse the raw JSON string from Groq into a JavaScript object
    let parsedQuiz;
    try {
      parsedQuiz = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return res.status(500).json({
        success: false,
        error: 'AI returned invalid JSON',
      });
    }

    // Return the parsed quiz object to React
    return res.status(200).json({
      success: true,
      quiz: parsedQuiz,
    });
  } catch (error) {
    console.error('Groq generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate quiz from Groq',
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
