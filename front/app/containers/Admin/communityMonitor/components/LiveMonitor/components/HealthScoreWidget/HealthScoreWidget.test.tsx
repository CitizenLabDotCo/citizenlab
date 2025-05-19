import { transformSentimentScoreData } from './utils';

const scoreResults = {
  overall: {
    averages: {
      '2024-4': 3.1,
      '2025-1': 3,
    },
    totals: {
      '2024-4': {
        1: 10,
        2: 3,
        3: 2,
        4: 5,
        5: 15,
      },
      '2025-1': {
        1: 22,
        2: 5,
        3: 4,
        4: 7,
        5: 17,
      },
    },
  },
  categories: {
    averages: {
      quality_of_life: {
        '2024-4': 2.9,
        '2025-1': 2.6,
      },
      service_delivery: {
        '2024-4': 3.2,
        '2025-1': 3,
      },
      governance_and_trust: {
        '2024-4': 3.5,
        '2025-1': 3.7,
      },
      other: {
        '2024-4': 4.2,
        '2025-1': 4.5,
      },
    },
    multilocs: {
      quality_of_life: {
        en: 'Quality of life',
      },
      service_delivery: {
        en: 'Service delivery',
      },
      governance_and_trust: {
        en: 'Governance and trust',
      },
      other: {
        en: 'Other',
      },
    },
  },
};

const locale = 'en';

describe('transformSentimentScoreData', () => {
  it('should transform valid scoreResults correctly', () => {
    const result = transformSentimentScoreData(scoreResults, locale);

    expect(result).toEqual({
      overallHealthScores: [
        { period: '2024-4', score: 3.1 },
        { period: '2025-1', score: 3 },
      ],
      totalHealthScoreCounts: [
        {
          period: '2024-4',
          totals: [
            { sentimentValue: '1', count: 10 },
            { sentimentValue: '2', count: 3 },
            { sentimentValue: '3', count: 2 },
            { sentimentValue: '4', count: 5 },
            { sentimentValue: '5', count: 15 },
          ],
        },
        {
          period: '2025-1',
          totals: [
            { sentimentValue: '1', count: 22 },
            { sentimentValue: '2', count: 5 },
            { sentimentValue: '3', count: 4 },
            { sentimentValue: '4', count: 7 },
            { sentimentValue: '5', count: 17 },
          ],
        },
      ],
      categoryHealthScores: [
        {
          category: 'quality_of_life',
          localizedLabel: 'Quality of life',
          scores: [
            { period: '2024-4', score: 2.9 },
            { period: '2025-1', score: 2.6 },
          ],
        },
        {
          category: 'service_delivery',
          localizedLabel: 'Service delivery',
          scores: [
            { period: '2024-4', score: 3.2 },
            { period: '2025-1', score: 3 },
          ],
        },
        {
          category: 'governance_and_trust',
          localizedLabel: 'Governance and trust',
          scores: [
            { period: '2024-4', score: 3.5 },
            { period: '2025-1', score: 3.7 },
          ],
        },
        {
          category: 'other',
          localizedLabel: 'Other',
          scores: [
            { period: '2024-4', score: 4.2 },
            { period: '2025-1', score: 4.5 },
          ],
        },
      ],
    });
  });

  it('should return null if scoreResults is undefined', () => {
    expect(transformSentimentScoreData(undefined, locale)).toBeNull();
  });

  it('should return null if scoreResults has missing keys', () => {
    expect(transformSentimentScoreData({}, locale)).toBeNull();
  });
});
