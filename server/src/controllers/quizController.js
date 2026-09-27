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

    let clientError = 'Failed to generate quiz from AI. Please try again.';
    const errMsg = typeof error?.message === 'string' ? error.message : '';

    if (
      errMsg.includes('json_validate_failed') ||
      errMsg.includes('jsonschema') ||
      errMsg.includes('invalid quiz structure') ||
      errMsg.includes('failed_generation')
    ) {
      clientError = 'The AI was unable to generate a valid quiz for this topic. Please try again or rephrase.';
    } else if (errMsg.includes('rate_limit') || errMsg.includes('429')) {
      clientError = 'The AI service is currently busy. Please wait a moment and try again.';
    } else if (errMsg && !errMsg.includes('{') && !errMsg.includes('\n') && errMsg.length < 150) {
      clientError = errMsg;
    }

    return res.status(500).json({
      success: false,
      error: clientError,
    });
  }
}
