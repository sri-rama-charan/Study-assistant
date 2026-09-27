/**
 * Result screen component displayed after completing the quiz.
 *
 * @param {object} props
 * @param {object} props.quiz - The completed quiz object { title, questions }
 * @param {number} props.score - The total number of correct answers
 * @param {object} props.selectedAnswers - Map of questionId -> selectedOptionId
 * @param {function} props.onTryAgain - Handler to reset and restart the quiz
 * @param {function} props.onReview - Handler to open the answers review view
 */
function QuizResult({ quiz, score, selectedAnswers, onTryAgain, onReview }) {
  const totalQuestions = quiz?.questions?.length || 5;
  const percentage = Math.round((score / totalQuestions) * 100);

  // Friendly feedback message based on performance
  const getFeedbackMessage = () => {
    if (score === totalQuestions) {
      return 'Outstanding! You achieved a perfect score!';
    }
    if (score >= Math.ceil(totalQuestions * 0.7)) {
      return 'Great job! You have a solid grasp of this topic.';
    }
    if (score >= Math.ceil(totalQuestions * 0.5)) {
      return 'Good effort! Review the concepts and try again to improve.';
    }
    return 'Keep practicing! Review this study topic and give it another shot.';
  };

  return (
    <div className="flex flex-col items-center text-center py-2">
      {/* Quiz Title */}
      <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400 mb-1">
        Quiz Completed
      </span>
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 break-words">
        {quiz?.title || 'Study Quiz'}
      </h2>

      {/* Score Badge Card */}
      <div className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
          Your Score
        </p>
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-4xl sm:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {score}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-gray-400 dark:text-gray-500">
            / {totalQuestions}
          </span>
        </div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">
          {percentage}% Correct
        </p>
      </div>

      {/* Feedback Message */}
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-8 max-w-sm leading-relaxed break-words">
        {getFeedbackMessage()}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={onReview}
          className="w-full sm:w-auto sm:min-w-[160px] py-3 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
        >
          Review Answers
        </button>
        <button
          type="button"
          onClick={onTryAgain}
          className="w-full sm:w-auto sm:min-w-[160px] py-3 px-6 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 font-semibold text-sm transition-colors shadow-sm cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default QuizResult;
