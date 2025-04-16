import { GroupedAnswer } from 'api/survey_results/types';

import { transformGroupedAnswerUsableArray } from './utils';

describe('transformGroupedAnswerUsableArray', () => {
  const sampleGroupedAnswers: GroupedAnswer[] = [
    {
      answer: 1,
      count: 1,
      groups: [{ group: null, count: 1 }],
    },
    {
      answer: 2,
      count: 0,
      groups: [],
    },
    {
      answer: 3,
      count: 3,
      groups: [{ group: 'unspecified', count: 3 }],
    },
    {
      answer: 4,
      count: 4,
      groups: [{ group: 'unspecified', count: 4 }],
    },
    {
      answer: 5,
      count: 5,
      groups: [
        { group: 'male', count: 1 },
        { group: 'female', count: 1 },
        { group: 'unspecified', count: 2 },
        { group: null, count: 1 },
      ],
    },
    {
      answer: null,
      count: 6,
      groups: [{ group: 'unspecified', count: 6 }],
    },
  ];

  it('transforms grouped answer for groupKey = "male"', () => {
    const result = transformGroupedAnswerUsableArray(
      sampleGroupedAnswers,
      'male'
    );
    expect(result).toEqual([
      { answer: 1, count: 0 },
      { answer: 2, count: 0 },
      { answer: 3, count: 0 },
      { answer: 4, count: 0 },
      { answer: 5, count: 1 },
      { answer: null, count: 0 },
    ]);
  });

  it('transforms grouped answer for groupKey = "female"', () => {
    const result = transformGroupedAnswerUsableArray(
      sampleGroupedAnswers,
      'female'
    );
    expect(result).toEqual([
      { answer: 1, count: 0 },
      { answer: 2, count: 0 },
      { answer: 3, count: 0 },
      { answer: 4, count: 0 },
      { answer: 5, count: 1 },
      { answer: null, count: 0 },
    ]);
  });

  it('transforms grouped answer for groupKey = "unspecified"', () => {
    const result = transformGroupedAnswerUsableArray(
      sampleGroupedAnswers,
      'unspecified'
    );
    expect(result).toEqual([
      { answer: 1, count: 0 },
      { answer: 2, count: 0 },
      { answer: 3, count: 3 },
      { answer: 4, count: 4 },
      { answer: 5, count: 2 },
      { answer: null, count: 6 },
    ]);
  });

  it('transforms grouped answer for groupKey = "nonexistent-group"', () => {
    const result = transformGroupedAnswerUsableArray(
      sampleGroupedAnswers,
      'nonexistent-group'
    );
    expect(result).toEqual([
      { answer: 1, count: 0 },
      { answer: 2, count: 0 },
      { answer: 3, count: 0 },
      { answer: 4, count: 0 },
      { answer: 5, count: 0 },
      { answer: null, count: 0 },
    ]);
  });
});
