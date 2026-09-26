import { useState } from 'react';
import QuizForm from './components/QuizForm';
import ResponsePreview from './components/ResponsePreview';

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset feedback state
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
      const response = await fetch(`${API_BASE_URL}/api/generate-quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: trimmedTopic,
          difficulty: difficulty.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server rejected the request');
      }

      setApiResponse(data);
    } catch (err) {
      setApiError(
        err.message || 'Unable to connect to the backend server. Is it running on port 5000?'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            AI Study Quiz
          </h1>
        </header>

        {/* Quiz Form Component */}
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

        {/* Backend Response Preview Component */}
        <ResponsePreview response={apiResponse} />
      </div>
    </main>
  );
}

export default App;
