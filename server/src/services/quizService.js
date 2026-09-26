import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { quizSchema } from '../schemas/quizSchema.js';
import { validateQuiz } from '../validators/quizValidator.js';

// Ensure environment variables are loaded
dotenv.config();

// Initialize the Groq SDK client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generates and validates a study quiz using Groq LLM.
 *
 * @param {string} topic - The quiz topic
 * @param {string} difficulty - Difficulty level ("easy", "medium", or "hard")
 * @returns {Promise<object>} - Validated quiz object
 */
export async function generateQuiz(topic, difficulty) {
  // Prompt instructing Groq to return ONLY valid JSON matching the quiz contract with content-quality guidelines
  const prompt = `You are a quiz generator. Generate a study quiz about the topic "${topic}" at ${difficulty} difficulty.

Follow these strict requirements:
1. Generate exactly 5 questions.
2. Generate exactly 4 options per question.
3. Each question must have exactly ONE clearly correct answer.
4. correctAnswer must contain the ID of the correct option.
5. Include a clear explanation for every question that explains why the correctAnswer is right and does not contradict the question or answer.
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

Content Quality Rules:
- Questions must be factually accurate and appropriate for the requested topic.
- Questions must genuinely test the requested topic rather than loosely related concepts.
- Each question must have exactly ONE unambiguous, clearly correct answer.
- All incorrect options must be clearly incorrect for the question.
- Avoid ambiguous or debatable questions.
- The explanation must correctly explain why the selected correctAnswer is correct and must not contradict the question or its correct answer.
- Match the requested difficulty:
  * easy: fundamental concepts
  * medium: conceptual understanding and practical application
  * hard: deeper reasoning, edge cases, or code-based scenarios
- Before returning the final JSON, internally verify:
  * each question has one unambiguous correct answer
  * correctAnswer matches that answer
  * the explanation supports that answer
  * all questions are relevant to the requested topic and difficulty

Formatting rules:
- Return ONLY JSON.
- Do not use Markdown.
- Do not wrap the JSON in \`\`\`json code fences.
- Do not include any text before or after the JSON.`;

  // Call Groq API with Structured Outputs
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'openai/gpt-oss-20b',
    max_completion_tokens: 3000,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'quiz',
        strict: true,
        schema: quizSchema,
      },
    },
  });

  const rawResponse = chatCompletion.choices[0]?.message?.content || '';

  // Parse the raw JSON string from Groq into a JavaScript object
  let parsedQuiz;
  try {
    parsedQuiz = JSON.parse(rawResponse);
  } catch (parseError) {
    console.error('JSON parsing error:', parseError);
    throw new Error('AI returned invalid JSON');
  }

  // Validate the parsed quiz using application-level validator
  if (!validateQuiz(parsedQuiz)) {
    console.error('AI returned an invalid quiz structure:', parsedQuiz);
    throw new Error('AI returned an invalid quiz structure');
  }

  return parsedQuiz;
}
