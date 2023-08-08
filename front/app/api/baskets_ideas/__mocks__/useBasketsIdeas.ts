import { IBasketsIdeaData } from '../types';

export const basketsIdeasData: IBasketsIdeaData = {
  id: 'basketIdeaId',
  type: 'basket_idea',
  attributes: {
    votes: 1,
  },
  relationships: {
    idea: {
      data: {
        id: '1',
        type: 'idea',
      },
    },
    basket: {
      data: {
        id: '2',
        type: 'basket',
      },
    },
  },
};

export default jest.fn(() => {
  return { data: { data: basketsIdeasData } };
});
