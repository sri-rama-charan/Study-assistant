const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Communicates with the backend server to generate an AI study quiz.
 *
 * @param {object} params
 * @param {string} params.topic - The requested quiz topic
 * @param {string} params.difficulty - Difficulty level ("easy", "medium", or "hard")
 * @returns {Promise<object>} The validated quiz API response payload
 * @throws {Error} Detailed error object on network failure, invalid JSON, server error, or incomplete response
 */
export async function generateQuiz({ topic, difficulty }) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/api/generate-quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic,
        difficulty,
      }),
    });
  } catch (networkError) {
    const error = new Error(
      'Unable to connect to the quiz service. Please check your connection and try again.'
    );
    error.cause = networkError;
    throw error;
  }

  let data;
  try {
    data = await response.json();
  } catch (parseError) {
    const error = new Error('Something went wrong while generating the quiz. Please try again.');
    error.status = response.status;
    error.cause = parseError;
    throw error;
  }

  if (!response.ok || data?.success === false) {
    const rawMessage =
      typeof data?.error === 'string' && data.error.trim()
        ? data.error.trim()
        : data?.error?.message || data?.message || 'Something went wrong while generating the quiz. Please try again.';

    const error = new Error(rawMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  const quizData = data?.quiz || (data?.questions ? data : null);
  if (
    !quizData ||
    typeof quizData !== 'object' ||
    !Array.isArray(quizData.questions) ||
    quizData.questions.length === 0
  ) {
    const error = new Error('The quiz response was incomplete. Please try again.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
