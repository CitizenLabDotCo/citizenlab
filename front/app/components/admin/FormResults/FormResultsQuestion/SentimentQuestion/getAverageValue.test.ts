import { getAverageValue } from './components/GroupedSentimentScore/utils';
import { SentimentAnswers } from './utils';

describe('getAverageValue', () => {
  it('calculates correct average for a valid group', () => {
    const groupAnswers: SentimentAnswers = [
      { answer: 1, count: 5, percentage: 33 },
      { answer: 2, count: 0, percentage: 0 },
      { answer: 3, count: 0, percentage: 0 },
      { answer: 4, count: 1, percentage: 7 },
      { answer: 5, count: 1, percentage: 7 },
      { answer: null, count: 8, percentage: 53 },
    ];

    const groupAnswersArray = [
      { answer: 1, count: 5 },
      { answer: 2, count: 0 },
      { answer: 3, count: 0 },
      { answer: 4, count: 1 },
      { answer: 5, count: 1 },
      { answer: null, count: 8 },
    ];

    // (1×5) + (4×1) + (5×1) = 14
    // totalResponses = 7
    const result = getAverageValue(groupAnswers, groupAnswersArray);
    expect(result).toBe(2); // 14 / 7 = 2
  });

  it('returns undefined if groupAnswers is undefined', () => {
    const result = getAverageValue(undefined, []);
    expect(result).toBeUndefined();
  });

  it('returns undefined if total responses is 0', () => {
    const groupAnswers: SentimentAnswers = [
      { answer: 1, count: 0, percentage: 0 },
      { answer: 2, count: 0, percentage: 0 },
      { answer: 3, count: 0, percentage: 0 },
    ];

    const groupAnswersArray = [
      { answer: 1, count: 0 },
      { answer: 2, count: 0 },
      { answer: 3, count: 0 },
    ];

    const result = getAverageValue(groupAnswers, groupAnswersArray);
    expect(result).toBeUndefined();
  });

  it('ignores entries with null answers or missing counts', () => {
    const groupAnswers: SentimentAnswers = [
      { answer: 1, count: 2, percentage: 20 },
      { answer: null, count: 5, percentage: 50 }, // Should be ignored
      { answer: 4, count: 1, percentage: 10 },
    ];

    const groupAnswersArray = [
      { answer: 1, count: 2 },
      { answer: null, count: 5 }, // Now excluded in response count
      { answer: 4, count: 1 },
    ];

    // totalValue = (1×2 + 4×1) = 6
    // totalResponses = 3 (excluding null)
    const result = getAverageValue(groupAnswers, groupAnswersArray);
    expect(result).toBe(2); // 6 / 3 = 2
  });

  it('rounds to nearest integer', () => {
    const groupAnswers: SentimentAnswers = [
      { answer: 3, count: 2, percentage: 50 }, // total = 6
      { answer: 5, count: 1, percentage: 25 }, // total = 5
    ];

    const groupAnswersArray = [
      { answer: 3, count: 2 },
      { answer: 5, count: 1 },
    ];

    // totalValue = 11, responses = 3 → avg = 3.666 → rounds to 3.7
    const result = getAverageValue(groupAnswers, groupAnswersArray);
    expect(result).toBe(3.7);
  });
});
