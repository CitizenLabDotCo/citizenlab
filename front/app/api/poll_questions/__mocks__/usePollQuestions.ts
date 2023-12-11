import { IPollQuestionData } from '../types';

export const pollQuestionsData: IPollQuestionData[] = [
  {
    id: '6a11060b-0efe-404b-9a68-2e84114873f9',
    type: 'question',
    attributes: {
      question_type: 'multiple_options',
      title_multiloc: { en: 'question' },
      max_options: 3,
      ordering: 0,
    },
    relationships: {
      phase: {
        data: { id: '540935af-fa3c-40de-a567-4a31c3c636d2' },
      },
      options: {
        data: [
          { id: 'd7065f7c-8b96-4b80-bb28-8b48e3f50f47', type: 'option' },
          { id: 'df49067b-233b-4f85-85e1-2a6704f5af1d', type: 'option' },
          { id: '8235a396-f524-427e-b9c3-11d095f46734', type: 'option' },
        ],
      },
    },
  },
  {
    id: '1e5112ef-aaf6-4dc3-8765-2b9094af6ef4',
    type: 'question',
    attributes: {
      question_type: 'single_option',
      title_multiloc: { en: 'question' },
      max_options: null,
      ordering: 1,
    },
    relationships: {
      phase: {
        data: { id: '540935af-fa3c-40de-a567-4a31c3c636d2' },
      },
      options: {
        data: [
          { id: '52bb7424-11e1-4a47-a450-48fe90d04cb2', type: 'option' },
          { id: 'd3f55351-1014-44fa-99b3-32f1a727a3d3', type: 'option' },
        ],
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: pollQuestionsData } };
});
