import { ICommonGroundResults } from '../types';

export const sampleCommonGroundResults: ICommonGroundResults = {
  data: {
    id: 'stub-phase-results-1',
    type: 'common_ground_results',
    attributes: {
      numParticipants: 150,
      numStatements: 45,
      numVotes: 320,
      top_consensus_ideas: [
        {
          id: '4e525b7c-92b2-4537-b2ac-653196c5507a',
          title_multiloc: {
            en: 'Older adults need safer sidewalks, benches, and public toilets.',
          },
          votes: {
            up: 43,
            down: 15,
            neutral: 41,
          },
        },
        {
          id: '5e8587ba-785d-48f8-b288-6bee6e9b3f1b',
          title_multiloc: {
            en: 'Coping with rent discourages landlords from investing or improving their properties.',
          },
          votes: {
            up: 77,
            down: 8,
            neutral: 14,
          },
        },
        {
          id: 'd4c0da54-ddac-4122-ac9f-e793388de946',
          title_multiloc: {
            en: 'The city should convert more vacant buildings into affordable housing units.',
          },
          votes: {
            up: 83,
            down: 5,
            neutral: 11,
          },
        },
      ],
      top_controversial_ideas: [
        {
          id: '1055f915-32aa-48e4-8001-eba130a3bead',
          title_multiloc: {
            en: 'Rent freezes unfairly restrict property owners.',
          },
          votes: {
            up: 44,
            down: 44,
            neutral: 12,
          },
        },
        {
          id: '986ed167-1053-4db9-acc5-f4a777ce0579',
          title_multiloc: {
            en: 'Coping with rent discourages landlords from investing or improving their properties.',
          },
          votes: {
            up: 77,
            down: 8,
            neutral: 14,
          },
        },
        {
          id: '4e525b7c-92b2-4537-b2ac-653196c5507a',
          title_multiloc: {
            en: 'The city should convert more vacant buildings into affordable housing units.',
          },
          votes: {
            up: 83,
            down: 5,
            neutral: 11,
          },
        },
      ],
    },
  },
};
