import { IBasketData } from '../types';

export const basketData: IBasketData = {
  id: '1',
  type: 'basket',
  attributes: {
    submitted_at: '2020-10-01T10:00:00.000Z',
    total_votes: 1000,
  },
  relationships: {
    participation_context: {
      data: {
        id: '1',
        type: 'project',
      },
    },
    user: {
      data: {
        id: '1',
        type: 'user',
      },
    },
    ideas: {
      data: [
        {
          id: '1',
          type: 'idea',
        },
        {
          id: '2',
          type: 'idea',
        },
      ],
    },
  },
};

export default jest.fn(() => {
  return { data: { data: basketData } };
});
