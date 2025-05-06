import { ICommonGroundStatements } from '../types';

export const sampleCommonGroundStatements: ICommonGroundStatements = {
  data: [
    {
      id: '1',
      type: 'statement',
      attributes: {
        author: 'Alice',
        publishedAt: '2h ago',
        body: { en: 'We should invest in public transport.' },
        reactions: { agree: 10, unsure: 2, disagree: 1 },
      },
    },
    {
      id: '2',
      type: 'statement',
      attributes: {
        author: 'Bob',
        publishedAt: '5h ago',
        body: { en: 'More green spaces are needed in the city.' },
        reactions: { agree: 8, unsure: 3, disagree: 2 },
      },
    },
  ],
};
