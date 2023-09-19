import { IInsight } from '../types';

export const insightsData: IInsight['data'][] = [
  {
    id: '1',
    type: 'insight',

    relationships: {
      background_task: {
        data: {
          id: '1',
          type: 'background_task',
        },
      },
      insightable: {
        data: {
          id: '1',
          type: 'summary',
        },
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: insightsData } };
});
