import { ICustomFieldInputType } from 'api/custom_fields/types';
import { ResultUngrouped } from 'api/survey_results/types';

import { getPercentageDifference, parseResult } from './utils';

describe('parseResult', () => {
  const result = {
    inputType: 'sentiment_linear_scale' as ICustomFieldInputType,
    question: {
      en: 'Another sentiment scale question',
      'fr-BE': '',
      'nl-BE': '',
    },
    description: {},
    customFieldId: 'b59cec02-896f-4a10-b70f-08272c7dd666',
    required: false,
    grouped: false,
    hidden: false,
    totalResponseCount: 8,
    questionResponseCount: 2,
    pageNumber: 1,
    questionNumber: 12,
    totalPickCount: 8,
    answers: [
      {
        answer: 1,
        count: 0,
      },
      {
        answer: 2,
        count: 0,
      },
      {
        answer: 3,
        count: 0,
      },
      {
        answer: 4,
        count: 1,
      },
      {
        answer: 5,
        count: 1,
      },
      {
        answer: null,
        count: 6,
      },
    ],
    multilocs: {
      answer: {
        1: {
          title_multiloc: {
            en: '1 - Very bad',
            'nl-BE': '1',
            'fr-BE': '1',
          },
        },
        2: {
          title_multiloc: {
            en: '2 - Bad',
            'nl-BE': '2',
            'fr-BE': '2',
          },
        },
        3: {
          title_multiloc: {
            en: '3 - Ok',
            'nl-BE': '3',
            'fr-BE': '3',
          },
        },
        4: {
          title_multiloc: {
            en: '4 - Good',
            'nl-BE': '4',
            'fr-BE': '4',
          },
        },
        5: {
          title_multiloc: {
            en: '5 - Very good',
            'nl-BE': '5',
            'fr-BE': '5',
          },
        },
      },
    },
    questionCategory: 'other',
    averages: {
      this_period: 4.5,
      last_period: null,
    },
  } as ResultUngrouped;

  it('should correctly parse the result and return sentiment answers with percentages and labels', () => {
    const parsedResult = parseResult(result);

    // Test the length of the parsed result (should be 6 as we have 6 answers)
    expect(parsedResult).toHaveLength(6);

    // Test for value 1
    expect(parsedResult?.[0]).toEqual({
      answer: 1,
      count: 0,
      percentage: 0, // 0 / 2 * 100 = 0
      label: {
        en: '1 - Very bad',
        'fr-BE': '1',
        'nl-BE': '1',
      },
    });

    // Test for value 2
    expect(parsedResult?.[1]).toEqual({
      answer: 2,
      count: 0,
      percentage: 0, // 0 / 2 * 100 = 0
      label: {
        en: '2 - Bad',
        'fr-BE': '2',
        'nl-BE': '2',
      },
    });

    // Test for value 5
    expect(parsedResult?.[4]).toEqual({
      answer: 5,
      count: 1,
      percentage: 50, // 1 / 2 * 100 = 60
      label: {
        en: '5 - Very good',
        'fr-BE': '5',
        'nl-BE': '5',
      },
    });
  });

  it('should correctly parse percentages for all answers', () => {
    const parsedResult = parseResult(result);

    // Validate the percentage calculation for each answer
    expect(parsedResult?.[0].percentage).toBe(0); // 0 / 2 * 100 = 0
    expect(parsedResult?.[1].percentage).toBe(0); // 0 / 2 * 100 = 0
    expect(parsedResult?.[2].percentage).toBe(0); // 0 / 2 * 100 = 0
    expect(parsedResult?.[3].percentage).toBe(50); // 1 / 2 * 100 = 50
    expect(parsedResult?.[4].percentage).toBe(50); // 1 / 2 * 100 = 50
  });
});

describe('getPercentageDifference', () => {
  it('should return null if thisPeriodAvg is null or undefined', () => {
    expect(getPercentageDifference(null, 5)).toBeNull();
    expect(getPercentageDifference(undefined, 5)).toBeNull();
    expect(getPercentageDifference(5, null)).toBeNull();
    expect(getPercentageDifference(5, undefined)).toBeNull();
  });

  it('should return null if lastPeriodAvg is null or undefined', () => {
    expect(getPercentageDifference(5, null)).toBeNull();
    expect(getPercentageDifference(5, undefined)).toBeNull();
  });

  it('should return 0 if lastPeriodAvg is 0', () => {
    expect(getPercentageDifference(10, 0)).toBe(0); // No difference when dividing by 0
    expect(getPercentageDifference(0, 0)).toBe(0); // Both periods are 0, so the difference is 0
  });

  it('should calculate percentage difference when both periods are positive numbers', () => {
    const result = getPercentageDifference(15, 10);
    expect(result).toBe(50); // ((15 - 10) / 10) * 100 = 50
  });

  it('should calculate percentage difference when the value of thisPeriodAvg is less than lastPeriodAvg', () => {
    const result = getPercentageDifference(5, 10);
    expect(result).toBe(-50); // ((5 - 10) / 10) * 100 = -50
  });

  it('should calculate percentage difference when thisPeriodAvg is negative', () => {
    const result = getPercentageDifference(-5, 10);
    expect(result).toBe(-150); // ((-5 - 10) / 10) * 100 = -150
  });

  it('should handle decimal numbers correctly', () => {
    const result = getPercentageDifference(7.5, 5);
    expect(result).toBe(50); // ((7.5 - 5) / 5) * 100 = 50
  });

  it('should return null if both periods are zero', () => {
    expect(getPercentageDifference(0, 0)).toBe(0); // Both are 0, so difference is 0, not null
  });
});
