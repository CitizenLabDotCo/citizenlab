import { parseGroupedResult } from './utils';

describe('parseGroupedResult', () => {
  const mockMultilocs = {
    answer: {
      1: { title_multiloc: { en: '1 - Very poor' } },
      2: { title_multiloc: { en: '2 - Poor' } },
      3: { title_multiloc: { en: '3 - Fair' } },
      4: { title_multiloc: { en: '4 - Good' } },
      5: { title_multiloc: { en: '5 - Excellent' } },
    },
  };

  const mockResult = {
    multilocs: mockMultilocs,
  };

  it('parses answers and percentages correctly', () => {
    const groupAnswers = [
      { answer: 1, count: 1 },
      { answer: 2, count: 1 },
      { answer: 3, count: 3 },
      { answer: 4, count: 0 },
      { answer: 5, count: 5 },
    ];

    const result = parseGroupedResult(mockResult as any, groupAnswers);

    expect(result).toEqual([
      {
        answer: 1,
        count: 1,
        percentage: 10, // 1 / 10
        label: { en: '1 - Very poor' },
      },
      {
        answer: 2,
        count: 1,
        percentage: 10,
        label: { en: '2 - Poor' },
      },
      {
        answer: 3,
        count: 3,
        percentage: 30,
        label: { en: '3 - Fair' },
      },
      {
        answer: 4,
        count: 0,
        percentage: 0,
        label: { en: '4 - Good' },
      },
      {
        answer: 5,
        count: 5,
        percentage: 50,
        label: { en: '5 - Excellent' },
      },
    ]);
  });

  it('returns empty array if total count is 0', () => {
    const groupAnswers = [
      { answer: 1, count: 0 },
      { answer: 2, count: 0 },
    ];

    const result = parseGroupedResult(mockResult as any, groupAnswers);
    expect(result).toEqual([]);
  });

  it('parses null answers and sets label to undefined', () => {
    const groupAnswers = [
      { answer: 1, count: 1 },
      { answer: null, count: 5 }, // intentionally excluded from percentage base
    ];

    const result = parseGroupedResult(mockResult as any, groupAnswers);

    expect(result).toEqual([
      {
        answer: 1,
        count: 1,
        percentage: 100,
        label: { en: '1 - Very poor' },
      },
    ]);
  });

  it('parses stringified answer values correctly', () => {
    const groupAnswers = [
      { answer: '1', count: 1 },
      { answer: '2', count: 1 },
    ];

    const result = parseGroupedResult(mockResult as any, groupAnswers);

    expect(result).toEqual([
      {
        answer: 1,
        count: 1,
        percentage: 50,
        label: { en: '1 - Very poor' },
      },
      {
        answer: 2,
        count: 1,
        percentage: 50,
        label: { en: '2 - Poor' },
      },
    ]);
  });
});
