import { ISummaryData } from '../types';

export const summaryData: ISummaryData = {
  id: '1',
  type: 'summary',
  attributes: {
    summary: 'I want to see more ponds in the park',
    accuracy: 0.5,
    filters: {
      comments_from: 5,
    },
    created_at: '2020-01-01T00:00:00.000Z',
    updated_at: '2020-01-01T00:00:00.000Z',
    bookmarked: true,
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
  return { data: { data: summaryData } };
});
