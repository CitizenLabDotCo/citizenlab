import { IQuestionData } from '../types';

export const questionData: IQuestionData = {
  id: '1',
  type: 'analysis_question',
  attributes: {
    question: ' Ask a question?',
    answer: 'Answer',
    accuracy: 0.5,
    filters: {
      comments_from: 5,
    },
    created_at: '2020-01-01T00:00:00.000Z',
    updated_at: '2020-01-01T00:00:00.000Z',
  },
  relationships: {
    background_task: {
      data: {
        id: '1',
        type: 'background_task',
      },
    },
  },
};

export default jest.fn(() => {
  return { data: { data: questionData } };
});
