import { ICustomFieldInputType } from 'api/custom_fields/types';
import { ResultUngrouped } from 'api/survey_results/types';

import { parseResult } from './utils';

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

    // Test the first item
    expect(parsedResult?.[0]).toEqual({
      answer: 1,
      count: 2,
      percentage: 40, // 2 / 5 * 100 = 40
      label: '1', // title_multiloc for answer 1
    });

    // Test the second item
    expect(parsedResult?.[1]).toEqual({
      answer: 2,
      count: 1,
      percentage: 20, // 1 / 5 * 100 = 20
      label: '2', // title_multiloc for answer 2
    });

    // Test for the null answer (this should not have a label)
    expect(parsedResult?.[5]).toEqual({
      answer: null,
      count: 3,
      percentage: 60, // 3 / 5 * 100 = 60
      label: undefined, // No label for null answer
    });
  });

  it('should correctly parse percentages for all answers', () => {
    const parsedResult = parseResult(result);

    // Validate the percentage calculation for each answer
    expect(parsedResult?.[0].percentage).toBe(40); // 2 / 5 * 100 = 40
    expect(parsedResult?.[1].percentage).toBe(20); // 1 / 5 * 100 = 20
    expect(parsedResult?.[2].percentage).toBe(0); // 0 / 5 * 100 = 0
    expect(parsedResult?.[3].percentage).toBe(0); // 0 / 5 * 100 = 0
    expect(parsedResult?.[4].percentage).toBe(40); // 2 / 5 * 100 = 40
    expect(parsedResult?.[5].percentage).toBe(60); // 3 / 5 * 100 = 60
  });
});
