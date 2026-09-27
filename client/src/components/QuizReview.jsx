/**
 * Review screen component to examine all questions, selected answers,
 * correctness, correct answers, and AI explanations after quiz completion.
 *
 * @param {object} props
 * @param {object} props.quiz - The completed quiz object { title, questions }
 * @param {object} props.selectedAnswers - Map of questionId -> selectedOptionId
 * @param {function} props.onBackToResult - Handler to navigate back to the result summary
 */
function QuizReview({ quiz, selectedAnswers, onBackToResult }) {
  const questions = quiz?.questions || [];

  return (
    <div className="flex flex-col text-left">
      {/* Header with Title and Back to Result Button */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-6">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-indigo-600 dark:text-indigo-400">
            Review Answers
          </span>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {quiz?.title || 'Quiz Review'}
          </h2>
        </div>
        <button
          type="button"
          onClick={onBackToResult}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          Back to Result
        </button>
      </div>

      {/* Questions Review List */}
      <div className="flex flex-col gap-6">
        {questions.map((question, index) => {
          const userOptionId = selectedAnswers?.[question.id];
          const isCorrect = userOptionId === question.correctAnswer;

          const userOption = question.options?.find((opt) => opt.id === userOptionId);
          const correctOption = question.options?.find(
            (opt) => opt.id === question.correctAnswer
          );

          return (
            <div
              key={question.id || index}
              className="p-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 shadow-xs flex flex-col gap-3.5"
            >
              {/* Question Number and Status Badge */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  Question {index + 1} of {questions.length}
                </span>

                {isCorrect ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    Correct
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                    Incorrect
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                {question.question}
              </h3>

              {/* User Selected Answer */}
              <div className="text-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">
                  Your Answer
                </span>
                <div
                  className={`p-3 rounded-xl border text-sm font-medium ${
                    isCorrect
                      ? 'border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200'
                      : 'border-rose-300 dark:border-rose-800/80 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  {userOption ? (
                    <span>
                      <strong className="uppercase mr-1.5">{userOption.id}.</strong>
                      {userOption.text}
                    </span>
                  ) : (
                    <span className="italic text-gray-400">No answer selected</span>
                  )}
                </div>
              </div>

              {/* Correct Answer (displayed if user was incorrect) */}
              {!isCorrect && (
                <div className="text-sm">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">
                    Correct Answer
                  </span>
                  <div className="p-3 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-medium">
                    {correctOption ? (
                      <span>
                        <strong className="uppercase mr-1.5">{correctOption.id}.</strong>
                        {correctOption.text}
                      </span>
                    ) : (
                      <span className="uppercase">{question.correctAnswer}</span>
                    )}
                  </div>
                </div>
              )}

              {/* AI Explanation */}
              {question.explanation && (
                <div className="mt-1 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-750/60 border border-gray-200 dark:border-gray-700 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-gray-900 dark:text-gray-200 block mb-1">
                    Explanation
                  </span>
                  <p className="leading-relaxed">{question.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Back to Result Button */}
      <div className="mt-8 flex justify-center">
        <button
          type="button"
          onClick={onBackToResult}
          className="w-full sm:w-auto min-w-[200px] py-3 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
        >
          Back to Result
        </button>
      </div>
    </div>
  );
}

export default QuizReview;
