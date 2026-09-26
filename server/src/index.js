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

// JSON Schema definition for quiz Structured Outputs
const quizSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'The title of the quiz topic',
    },
    questions: {
      type: 'array',
      description: 'List of exactly 5 quiz questions',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique identifier for the question',
          },
          question: {
            type: 'string',
            description: 'The question text',
          },
          options: {
            type: 'array',
            description: 'List of exactly 4 choices',
            minItems: 4,
            maxItems: 4,
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Option identifier (e.g. a, b, c, or d)',
                },
                text: {
                  type: 'string',
                  description: 'The option display text',
                },
              },
              required: ['id', 'text'],
              additionalProperties: false,
            },
          },
          correctAnswer: {
            type: 'string',
            description: 'The option ID that represents the correct answer',
          },
          explanation: {
            type: 'string',
            description: 'Explanation for why the correct answer is right',
          },
        },
        required: ['id', 'question', 'options', 'correctAnswer', 'explanation'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'questions'],
  additionalProperties: false,
};

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

    // Basic root-level validation for the parsed quiz
    const isValidRoot =
      parsedQuiz &&
      typeof parsedQuiz === 'object' &&
      !Array.isArray(parsedQuiz) &&
      typeof parsedQuiz.title === 'string' &&
      parsedQuiz.title.trim() !== '' &&
      Array.isArray(parsedQuiz.questions) &&
      parsedQuiz.questions.length === 5;

    if (!isValidRoot) {
      console.error('AI returned an invalid quiz root structure:', parsedQuiz);
      return res.status(500).json({
        success: false,
        error: 'AI returned an invalid quiz structure',
      });
    }

    // Validate the structure of each question
    const areQuestionsValid = parsedQuiz.questions.every((q) => {
      return (
        q &&
        typeof q === 'object' &&
        !Array.isArray(q) &&
        typeof q.id === 'string' &&
        q.id.trim() !== '' &&
        typeof q.question === 'string' &&
        q.question.trim() !== '' &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctAnswer === 'string' &&
        q.correctAnswer.trim() !== '' &&
        typeof q.explanation === 'string' &&
        q.explanation.trim() !== ''
      );
    });

    if (!areQuestionsValid) {
      console.error('AI returned an invalid question structure:', parsedQuiz.questions);
      return res.status(500).json({
        success: false,
        error: 'AI returned an invalid quiz structure',
      });
    }

    // Validate options and correctAnswer for every question
    const areOptionsAndAnswersValid = parsedQuiz.questions.every((q) => {
      // 1. Validate each option structure
      const areOptionsWellFormed = q.options.every((opt) => {
        return (
          opt &&
          typeof opt === 'object' &&
          !Array.isArray(opt) &&
          typeof opt.id === 'string' &&
          opt.id.trim() !== '' &&
          typeof opt.text === 'string' &&
          opt.text.trim() !== ''
        );
      });

      if (!areOptionsWellFormed) {
        return false;
      }

      // 2. Validate that option IDs are unique (4 options must yield 4 unique IDs)
      const optionIds = q.options.map((opt) => opt.id.trim());
      const uniqueOptionIds = new Set(optionIds);
      if (uniqueOptionIds.size !== 4) {
        return false;
      }

      // 3. Validate that correctAnswer matches exactly one option ID
      const trimmedCorrectAnswer = q.correctAnswer.trim();
      if (!optionIds.includes(trimmedCorrectAnswer)) {
        return false;
      }

      return true;
    });

    if (!areOptionsAndAnswersValid) {
      console.error('AI returned invalid options or correctAnswer:', parsedQuiz.questions);
      return res.status(500).json({
        success: false,
        error: 'AI returned an invalid quiz structure',
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
