import QuizResult from './QuizResult';
import QuizReview from './QuizReview';
import { useQuiz } from '../hooks/useQuiz';

/**
 * Interactive Quiz View component with sequential question navigation, scoring,
 * result summary, and answer review functionality.
 *
 * @param {object} props
 * @param {object} props.quiz - The validated quiz data { title, questions }
 * @param {function} [props.onReset] - Optional callback to reset and start a new quiz
 */
function QuizView({ quiz, onReset }) {
  const {
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    selectedAnswer,
    selectedAnswers,
    isLastQuestion,
    showResult,
    showReview,
    score,
    selectAnswer,
    nextQuestion,
    tryAgain,
    openReview,
    backToResult,
  } = useQuiz(quiz);

  // Guard against missing or malformed quiz data
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    return null;
  }

  // If reviewing answers, show the review screen
  if (showReview) {
    return (
      <QuizReview
        quiz={quiz}
        selectedAnswers={selectedAnswers}
        onBackToResult={backToResult}
      />
    );
  }

  // If the user has completed the quiz, show the result screen
  if (showResult) {
    return (
      <QuizResult
        quiz={quiz}
        score={score}
        selectedAnswers={selectedAnswers}
        onTryAgain={tryAgain}
        onReview={openReview}
      />
    );
  }

  // Guard if currentQuestion is not yet ready
  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="flex flex-col text-left">
      {/* Quiz Title & Header Meta */}
      <div className="flex items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Active Quiz
          </span>
          <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 break-words">
            {quiz.title}
          </h2>
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline cursor-pointer shrink-0"
          >
            New Quiz
          </button>
        )}
      </div>

      {/* Question Counter */}
      <div className="mb-2">
        <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          Question {currentQuestionIndex + 1} of {totalQuestions}
        </span>
      </div>

      {/* Question Text */}
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-5 leading-snug break-words">
        {currentQuestion.question}
      </h3>

      {/* Answer Options */}
      <div className="flex flex-col gap-3">
        {currentQuestion.options.map((option) => {
          const isSelected = selectedAnswer === option.id;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectAnswer(option.id)}
              className={`w-full flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 dark:border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-sm ring-2 ring-indigo-500/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {/* Option ID Badge */}
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {option.id.toUpperCase()}
              </span>

              {/* Option Text */}
              <span className="text-sm font-medium leading-relaxed break-words">
                {option.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Navigation action button */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={nextQuestion}
          disabled={!selectedAnswer}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLastQuestion ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}

export default QuizView;
