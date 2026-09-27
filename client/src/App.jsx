import { useState } from 'react';
import QuizForm from './components/QuizForm';
import QuizView from './components/QuizView';
import { generateQuiz } from './services/quizApi';
import { sanitizeErrorMessage } from './utils/errorUtils';

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

    // --- API request delegated to quizApi service ---
    setIsLoading(true);

    try {
      const data = await generateQuiz({
        topic: trimmedTopic,
        difficulty: difficulty.toLowerCase(),
      });

      setApiResponse(data);
    } catch (err) {
      setApiError(sanitizeErrorMessage(err));
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
