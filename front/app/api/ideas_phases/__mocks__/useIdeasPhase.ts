import { IdeasPhase } from '../types';

export const ideasPhase: IdeasPhase = {
  data: {
    id: '123',
    type: 'ideas_phase',
    attributes: {
      votes_count: 2,
      baskets_count: 1,
    },
    relationships: {
      idea: {
        data: {
          id: '58408ag54',
          type: 'idea',
        },
      },
      phase: {
        data: {
          id: '23gfgrj03',
          type: 'phase',
        },
      },
    },
  },
};

export default jest.fn(() => {
  return { data: ideasPhase };
});
