import { useState } from 'react';
import QuizForm from './components/QuizForm';
import QuizView from './components/QuizView';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  // Input state
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');

  // UI / Network state
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState('');

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
        const errorMessage =
          typeof data?.error === 'string' && data.error.trim()
            ? data.error.trim()
            : 'Something went wrong while generating the quiz. Please try again.';
        setApiError(errorMessage);
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
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
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
