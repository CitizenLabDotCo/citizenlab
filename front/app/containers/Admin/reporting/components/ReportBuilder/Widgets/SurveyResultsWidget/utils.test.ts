import { createResultRows } from './utils';
import { Result } from 'api/survey_results/types';

const results: Result[] = [
  {
    inputType: 'text',
    question: { en: 'q0' },
    totalResponses: 5,
    answers: [],
    required: true,
    customFieldId: '1',
  },
  {
    inputType: 'text',
    question: { en: 'q1' },
    totalResponses: 5,
    answers: [],
    required: true,
    customFieldId: '2',
  },
  {
    inputType: 'text',
    question: { en: 'q2' },
    totalResponses: 5,
    answers: [],
    required: true,
    customFieldId: '3',
  },
  {
    inputType: 'text',
    question: { en: 'q3' },
    totalResponses: 5,
    answers: [],
    required: true,
    customFieldId: '4',
  },
  {
    inputType: 'text',
    question: { en: 'q4' },
    totalResponses: 5,
    answers: [],
    required: true,
    customFieldId: '5',
  },
];

describe('createResultRows', () => {
  it('works with even number of results', () => {
    const shownQuestions = [true, true, false, true, true];

    const output = createResultRows(results, shownQuestions);
    const expectedOutput = [
      [results[0], results[1]],
      [results[3], results[4]],
    ];

    expect(output).toEqual(expectedOutput);
  });

  it('works with odd number of results', () => {
    const shownQuestions = [true, true, false, false, true];

    const output = createResultRows(results, shownQuestions);
    const expectedOutput = [[results[0], results[1]], [results[4]]];

    expect(output).toEqual(expectedOutput);
  });

  it('works if shownQuestions is undefined', () => {
    const output = createResultRows(results, undefined);
    const expectedOutput = [
      [results[0], results[1]],
      [results[2], results[3]],
      [results[4]],
    ];

    expect(output).toEqual(expectedOutput);
  });
});
