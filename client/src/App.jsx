import { useState } from 'react';
import QuizForm from './components/QuizForm';
import QuizView from './components/QuizView';
import { generateQuiz } from './services/quizApi';
import { sanitizeErrorMessage } from './utils/errorUtils';

function App() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');

  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [apiError, setApiError] = useState('');

  const handleTopicChange = (newTopic) => {
    setTopic(newTopic);
    if (validationError) setValidationError('');
  };

  const handleReset = () => {
    setQuiz(null);
    setTopic('');
    setApiError('');
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    setValidationError('');
    setQuiz(null);
    setApiError('');

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

    setIsLoading(true);

    try {
      const data = await generateQuiz({
        topic: trimmedTopic,
        difficulty: difficulty.toLowerCase(),
      });

      setQuiz(data.quiz);
    } catch (err) {
      setApiError(sanitizeErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-8 text-center break-words">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
            AI Study Quiz
          </h1>
        </header>

        {quiz ? (
          <QuizView
            quiz={quiz}
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
