import { useState, useEffect } from 'react';
import QuizForm from './components/QuizForm';
import QuizView from './components/QuizView';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const QUIZ_STORAGE_KEY = 'study_quiz_data';
const PROGRESS_STORAGE_KEY = 'study_quiz_progress';

/**
 * Normalizes backend and network errors into clean, friendly user-facing messages.
 * Prevents raw technical stack traces, JSON schema dumps, or Groq API internals
 * from leaking into the UI.
 *
 * @param {object} data - Parsed response payload from the backend
 * @param {number} responseStatus - HTTP status code
 * @returns {string} - Clean, human-readable error message
 */
function sanitizeErrorMessage(data, responseStatus) {
  if (responseStatus === 429) {
    return 'The quiz service is currently experiencing high demand. Please wait a moment and try again.';
  }

  // Extract raw error text from various possible payload formats
  let raw = '';
  if (typeof data?.error === 'string') {
    raw = data.error;
  } else if (typeof data?.error?.message === 'string') {
    raw = data.error.message;
  } else if (typeof data?.message === 'string') {
    raw = data.message;
  }

  raw = raw.trim();

  // Detect technical errors, raw JSON dumps, or schema validation messages
  const isTechnical =
    !raw ||
    raw.includes('failed_generation') ||
    raw.includes('json_validate_failed') ||
    raw.includes('jsonschema') ||
    raw.includes('does not validate') ||
    raw.includes('invalid_request_error') ||
    raw.includes('openai/') ||
    raw.includes('groq') ||
    raw.startsWith('400 {') ||
    raw.startsWith('500 {') ||
    raw.startsWith('{') ||
    raw.length > 200;

  if (isTechnical) {
    return 'Something went wrong while generating the quiz. Please try again or rephrase your topic.';
  }

  return raw;
}

function App() {
  // Input state
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');

  // UI / Network state
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize apiResponse from localStorage if present to survive page reload
  const [apiResponse, setApiResponse] = useState(() => {
    try {
      const saved = localStorage.getItem(QUIZ_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [apiError, setApiError] = useState('');

  // Synchronize apiResponse with localStorage
  useEffect(() => {
    try {
      if (apiResponse) {
        localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(apiResponse));
      } else {
        localStorage.removeItem(QUIZ_STORAGE_KEY);
        localStorage.removeItem(PROGRESS_STORAGE_KEY);
      }
    } catch {
      // Ignore localStorage exceptions
    }
  }, [apiResponse]);

  // Handle topic change and clear validation warning if any
  const handleTopicChange = (newTopic) => {
    setTopic(newTopic);
    if (validationError) setValidationError('');
  };

  // Reset all state to start a new quiz
  const handleReset = () => {
    setApiResponse(null);
    setTopic('');
    setApiError('');
    setValidationError('');
    try {
      localStorage.removeItem(QUIZ_STORAGE_KEY);
      localStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch {}
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent multiple requests while already loading
    if (isLoading) return;

    // Reset feedback state and previous quiz response
    setValidationError('');
    setApiResponse(null);
    setApiError('');

    // --- Client-side validation ---
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) {
      setValidationError('Please enter a quiz topic before submitting.');
      return;
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(difficulty.toLowerCase())) {
      setValidationError('Please select a valid difficulty: Easy, Medium, or Hard.');
      return;
    }

    // --- Network request to Express backend ---
    setIsLoading(true);

    try {
      let response;
      try {
        response = await fetch(`${API_BASE_URL}/api/generate-quiz`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            topic: trimmedTopic,
            difficulty: difficulty.toLowerCase(),
          }),
        });
      } catch {
        // Network failure, browser timeout, or unreachable backend
        setApiError(
          'Unable to connect to the quiz service. Please check your connection and try again.'
        );
        return;
      }

      // Try parsing response as JSON
      let data;
      try {
        data = await response.json();
      } catch {
        // Response is not valid JSON
        setApiError('Something went wrong while generating the quiz. Please try again.');
        return;
      }

      // Handle unsuccessful HTTP response or failed status from backend
      if (!response.ok || data?.success === false) {
        setApiError(sanitizeErrorMessage(data, response.status));
        return;
      }

      // Validate that the successful response contains a usable quiz object
      const quizData = data?.quiz || (data?.questions ? data : null);
      if (
        !quizData ||
        typeof quizData !== 'object' ||
        !Array.isArray(quizData.questions) ||
        quizData.questions.length === 0
      ) {
        setApiError('The quiz response was incomplete. Please try again.');
        return;
      }

      // Save successful response
      setApiResponse(data);
    } catch {
      // General fallback to prevent crashing the React app
      setApiError('Something went wrong while generating the quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Resolve quiz data whether nested under .quiz or returned directly
  const quizData = apiResponse?.quiz || (apiResponse?.questions ? apiResponse : null);

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-8 text-center break-words">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            AI Study Quiz
          </h1>
        </header>

        {/* If quiz data is available, display interactive QuizView; otherwise display QuizForm */}
        {quizData ? (
          <QuizView
            quiz={quizData}
            onReset={handleReset}
          />
        ) : (
          <QuizForm
            topic={topic}
            onTopicChange={handleTopicChange}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            validationError={validationError}
            apiError={apiError}
          />
        )}
      </div>
    </main>
  );
}

export default App;
