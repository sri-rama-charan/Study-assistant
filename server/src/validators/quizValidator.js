/**
 * Validates the structure and content integrity of an AI-generated quiz object.
 *
 * Rules verified:
 * - Root is a non-null object (not an array)
 * - Title is a non-empty string after trimming
 * - Questions is an array containing exactly 5 items
 * - Each question is a non-null object (not an array)
 * - Question id is a non-empty string after trimming
 * - Question text is a non-empty string after trimming
 * - Options is an array containing exactly 4 items
 * - CorrectAnswer is a non-empty string after trimming
 * - Explanation is a non-empty string after trimming
 * - Each option is a non-null object (not an array)
 * - Option id is a non-empty string after trimming
 * - Option text is a non-empty string after trimming
 * - Option IDs are unique within the question
 * - CorrectAnswer matches one of the question's option IDs
 *
 * @param {any} quiz - The parsed quiz data from Groq
 * @returns {boolean} - true if quiz passes all validation rules, false otherwise
 */
export function validateQuiz(quiz) {
  const isValidRoot =
    quiz &&
    typeof quiz === 'object' &&
    !Array.isArray(quiz) &&
    typeof quiz.title === 'string' &&
    quiz.title.trim() !== '' &&
    Array.isArray(quiz.questions) &&
    quiz.questions.length === 5;

  if (!isValidRoot) {
    return false;
  }

  const areQuestionsValid = quiz.questions.every((q) => {
    return (
      q &&
      typeof q === 'object' &&
      !Array.isArray(q) &&
      typeof q.id === 'string' &&
      q.id.trim() !== '' &&
      typeof q.question === 'string' &&
      q.question.trim() !== '' &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.correctAnswer === 'string' &&
      q.correctAnswer.trim() !== '' &&
      typeof q.explanation === 'string' &&
      q.explanation.trim() !== ''
    );
  });

  if (!areQuestionsValid) {
    return false;
  }

  const areOptionsAndAnswersValid = quiz.questions.every((q) => {
    const areOptionsWellFormed = q.options.every((opt) => {
      return (
        opt &&
        typeof opt === 'object' &&
        !Array.isArray(opt) &&
        typeof opt.id === 'string' &&
        opt.id.trim() !== '' &&
        typeof opt.text === 'string' &&
        opt.text.trim() !== ''
      );
    });

    if (!areOptionsWellFormed) {
      return false;
    }

    const optionIds = q.options.map((opt) => opt.id.trim());
    const uniqueOptionIds = new Set(optionIds);
    if (uniqueOptionIds.size !== 4) {
      return false;
    }

    const trimmedCorrectAnswer = q.correctAnswer.trim();
    if (!optionIds.includes(trimmedCorrectAnswer)) {
      return false;
    }

    return true;
  });

  if (!areOptionsAndAnswersValid) {
    return false;
  }

  return true;
}
