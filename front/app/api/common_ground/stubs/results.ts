import { ICommonGroundResults } from '../types';

export const sampleCommonGroundResults: ICommonGroundResults = {
  data: {
    id: 'stub-phase-results-1',
    type: 'phase-results',
    attributes: {
      numParticipants: 121,
      numStatements: 731,
      numVotes: 10827,
      majority: [
        {
          label: {
            en: 'Older adults need safer sidewalks, benches, and public toilets.',
          },
          agree: 43,
          unsure: 41,
          disagree: 15,
          total: 324,
        },
        {
          label: {
            en: 'Coping with rent discourages landlords from investing or improving their properties.',
          },
          agree: 77,
          unsure: 14,
          disagree: 8,
          total: 117,
        },
        {
          label: {
            en: 'The city should convert more vacant buildings into affordable housing units.',
          },
          agree: 83,
          unsure: 11,
          disagree: 5,
          total: 111,
        },
      ],
      divisive: [
        {
          label: { en: 'Rent freezes unfairly restrict property owners.' },
          agree: 44,
          unsure: 12,
          disagree: 44,
          total: 50,
        },
        {
          label: {
            en: 'Coping with rent discourages landlords from investing or improving their properties.',
          },
          agree: 77,
          unsure: 14,
          disagree: 8,
          total: 117,
        },
        {
          label: {
            en: 'The city should convert more vacant buildings into affordable housing units.',
          },
          agree: 83,
          unsure: 11,
          disagree: 5,
          total: 111,
        },
      ],
      uncertain: [
        {
          label: { en: 'Rent freezes unfairly restrict property owners.' },
          agree: 44,
          unsure: 12,
          disagree: 44,
          total: 50,
        },
        {
          label: {
            en: 'Coping with rent discourages landlords from investing or improving their properties.',
          },
          agree: 77,
          unsure: 14,
          disagree: 8,
          total: 117,
        },
        {
          label: {
            en: 'The city should convert more vacant buildings into affordable housing units.',
          },
          agree: 83,
          unsure: 11,
          disagree: 5,
          total: 111,
        },
      ],
      allStatements: [
        {
          label: { en: 'Rent freezes unfairly restrict property owners.' },
          agree: 44,
          unsure: 12,
          disagree: 44,
          total: 50,
        },
        {
          label: {
            en: 'Coping with rent discourages landlords from investing or improving their properties.',
          },
          agree: 77,
          unsure: 14,
          disagree: 8,
          total: 117,
        },
        {
          label: {
            en: 'The city should convert more vacant buildings into affordable housing units.',
          },
          agree: 83,
          unsure: 11,
          disagree: 5,
          total: 111,
        },
      ],
    },
  },
};
