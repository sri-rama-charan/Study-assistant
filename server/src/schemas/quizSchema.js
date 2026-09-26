// JSON Schema definition for quiz Structured Outputs
export const quizSchema = {
  type: 'object',
  properties: {
    title: {
      type: 'string',
      description: 'The title of the quiz topic',
    },
    questions: {
      type: 'array',
      description: 'List of exactly 5 quiz questions',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Unique identifier for the question',
          },
          question: {
            type: 'string',
            description: 'The question text',
          },
          options: {
            type: 'array',
            description: 'List of exactly 4 choices',
            minItems: 4,
            maxItems: 4,
            items: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                  description: 'Option identifier (e.g. a, b, c, or d)',
                },
                text: {
                  type: 'string',
                  description: 'The option display text',
                },
              },
              required: ['id', 'text'],
              additionalProperties: false,
            },
          },
          correctAnswer: {
            type: 'string',
            description: 'The option ID that represents the correct answer',
          },
          explanation: {
            type: 'string',
            description: 'Explanation for why the correct answer is right',
          },
        },
        required: ['id', 'question', 'options', 'correctAnswer', 'explanation'],
        additionalProperties: false,
      },
    },
  },
  required: ['title', 'questions'],
  additionalProperties: false,
};
