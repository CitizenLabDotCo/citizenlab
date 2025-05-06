import { ICommonGroundResults } from '../types';

export const sampleCommonGroundResults: ICommonGroundResults = {
  data: {
    id: 'stub-phase-results-1',
    type: 'phase-results',
    attributes: {
      numParticipants: 120,
      numStatements: 2,
      numVotes: 30,
      majority: [
        {
          label: { en: 'Invest in public transport.' },
          agree: 80,
          unsure: 10,
          disagree: 10,
          total: 100,
        },
      ],
      divisive: [
        {
          label: { en: 'Pedestrianize the city center.' },
          agree: 50,
          unsure: 50,
          disagree: 0,
          total: 100,
        },
      ],
    },
  },
};
