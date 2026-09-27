import { useState } from 'react';

/**
 * Custom hook managing quiz interaction state and business logic.
 *
 * Encapsulates:
 * - Active question index and navigation
 * - Answer selection and storage
 * - Score calculation
 * - Screen transition state (question view, result screen, review screen)
 *
 * @param {object} quiz - Validated quiz object with title and questions array
 * @returns {object} Quiz state and action handlers
 */
export function useQuiz(quiz) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [score, setScore] = useState(0);

  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex] || null;
  const isLastQuestion = totalQuestions > 0 && currentQuestionIndex === totalQuestions - 1;
  const selectedAnswer = currentQuestion ? selectedAnswers[currentQuestion.id] || null : null;

  const selectAnswer = (optionId) => {
    if (!currentQuestion) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const nextQuestion = () => {
    if (!selectedAnswer) return;

    if (isLastQuestion) {
      const totalScore = questions.reduce((total, q) => {
        return total + (selectedAnswers[q.id] === q.correctAnswer ? 1 : 0);
      }, 0);

      setScore(totalScore);
      setShowResult(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const tryAgain = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setScore(0);
    setShowResult(false);
    setShowReview(false);
  };

  const openReview = () => {
    setShowReview(true);
  };

  const backToResult = () => {
    setShowReview(false);
  };

  return {
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
  };
}
