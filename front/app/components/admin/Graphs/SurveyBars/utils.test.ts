import { ResultGrouped } from 'api/survey_results/types';

import { DEFAULT_CATEGORICAL_COLORS } from '../styling';

import { parseQuestionResult, EMPTY_COLOR } from './utils';

const testResult: ResultGrouped = {
  inputType: 'select',
  question: {
    en: 'Question: select',
  },
  customFieldId: '353bb3fd-7747-4394-82ab-4c0ac7daf200',
  required: false,
  grouped: true,
  totalResponseCount: 4,
  questionResponseCount: 4,
  totalPickCount: 4,
  answers: [
    {
      answer: 'select_option_1_q90',
      count: 2,
      groups: [
        {
          group: 'male',
          count: 2,
        },
      ],
    },
    {
      answer: 'select_option_2_sj8',
      count: 2,
      groups: [
        {
          group: 'female',
          count: 2,
        },
      ],
    },
    {
      answer: null,
      count: 0,
      groups: [],
    },
  ],
  multilocs: {
    answer: {
      select_option_1_q90: {
        title_multiloc: {
          en: 'select: Option 1',
        },
      },
      select_option_2_sj8: {
        title_multiloc: {
          en: 'select: Option 2',
        },
      },
    },
    group: {
      male: {
        title_multiloc: {
          en: 'Male',
        },
      },
      female: {
        title_multiloc: {
          en: 'Female',
        },
      },
      unspecified: {
        title_multiloc: {
          en: 'Other',
        },
      },
    },
  },
  legend: ['male', 'female', 'unspecified', null],
};

const expected = [
  {
    label: 'select: Option 1',
    count: 2,
    percentage: 50,
    bars: [
      {
        type: 'single',
        percentage: 50,
        color: '#2F478A',
      },
    ],
  },
  {
    label: 'select: Option 2',
    count: 2,
    percentage: 50,
    bars: [
      {
        type: 'single',
        percentage: 50,
        color: '#4D85C6',
      },
    ],
  },
  {
    label: 'No answer',
    count: 0,
    percentage: 0,
    bars: [
      {
        type: 'single',
        percentage: 0,
        color: EMPTY_COLOR,
      },
    ],
  },
];

describe('parseQuestionResult', () => {
  it('works', () => {
    expect(
      parseQuestionResult(
        testResult,
        DEFAULT_CATEGORICAL_COLORS,
        (x: any) => x['en'],
        'No answer'
      )
    ).toEqual(expected);
  });
});
