import DifficultySelector from './DifficultySelector';
import StatusAlert from './StatusAlert';

function QuizForm({
  topic,
  onTopicChange,
  difficulty,
  onDifficultyChange,
  onSubmit,
  isLoading,
  validationError,
  apiError,
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 text-left">
      {/* Topic Input */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="topic-input"
          className="text-sm font-semibold text-gray-700 dark:text-gray-200"
        >
          Topic:
        </label>
        <input
          id="topic-input"
          type="text"
          placeholder="e.g. JavaScript closures, React hooks, Photosynthesis"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          disabled={isLoading}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-60"
        />
      </div>

      {/* Difficulty Selector */}
      <DifficultySelector
        value={difficulty}
        onChange={onDifficultyChange}
        disabled={isLoading}
      />

      {/* Client-side validation warning */}
      <StatusAlert type="warning" message={validationError} />

      {/* Backend/network error message */}
      <StatusAlert type="error" message={apiError} />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-1 py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-base transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Generating quiz...</span>
          </>
        ) : (
          'Generate Quiz'
        )}
      </button>
    </form>
  );
}

export default QuizForm;
