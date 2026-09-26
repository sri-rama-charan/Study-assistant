import { generateQuiz } from '../services/quizService.js';

/**
 * Controller for POST /api/generate-quiz endpoint.
 *
 * Responsibilities:
 * - Read and validate request body parameters (topic, difficulty)
 * - Normalize parameters
 * - Delegate quiz generation to quizService
 * - Return HTTP responses
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function generateQuizController(req, res) {
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

  try {
    const quiz = await generateQuiz(topic.trim(), normalizedDifficulty);

    // Return the validated quiz object to React
    return res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate quiz from Groq',
    });
  }
}
