import { ResultGrouped } from 'api/survey_results/types';

import { DEFAULT_CATEGORICAL_COLORS } from '../styling';

import { parseQuestionResult, EMPTY_COLOR } from './utils';

describe('parseQuestionResult', () => {
  it('works', () => {
    const data: ResultGrouped = {
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
            count: 2,
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
            count: 2,
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
            count: 0,
            color: EMPTY_COLOR,
          },
        ],
      },
    ];

    expect(
      parseQuestionResult(
        data,
        DEFAULT_CATEGORICAL_COLORS,
        (x: any) => x['en'],
        'No answer'
      )
    ).toEqual(expected);
  });

  it('works for grouped data', () => {
    const data: ResultGrouped = {
      inputType: 'multiselect',
      question: {
        en: 'Question: multiselect',
      },
      customFieldId: '894c900b-fc12-4aaa-884b-e313cea89321',
      required: false,
      grouped: true,
      totalResponseCount: 4,
      questionResponseCount: 4,
      totalPickCount: 8,
      answers: [
        {
          answer: 'multiselect_option_1_s2e',
          count: 4,
          groups: [
            {
              group: 'male',
              count: 2,
            },
            {
              group: 'female',
              count: 2,
            },
          ],
        },
        {
          answer: 'multiselect_option_2_3c7',
          count: 4,
          groups: [
            {
              group: 'male',
              count: 2,
            },
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
          multiselect_option_1_s2e: {
            title_multiloc: {
              en: 'multiselect: Option 1',
            },
          },
          multiselect_option_2_3c7: {
            title_multiloc: {
              en: 'multiselect: Option 2',
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
        label: 'multiselect: Option 1',
        count: 4,
        percentage: 50,
        bars: [
          {
            type: 'first',
            count: 2,
            percentage: 25,
            color: '#2F478A',
          },
          {
            type: 'last',
            count: 2,
            percentage: 25,
            color: '#4D85C6',
          },
        ],
      },
      {
        label: 'multiselect: Option 2',
        count: 4,
        percentage: 50,
        bars: [
          {
            type: 'first',
            count: 2,
            percentage: 25,
            color: '#2F478A',
          },
          {
            type: 'last',
            count: 2,
            percentage: 25,
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
            count: 0,
            percentage: 0,
            color: '#B8C5D0',
          },
        ],
      },
    ];

    expect(
      parseQuestionResult(
        data,
        DEFAULT_CATEGORICAL_COLORS,
        (x: any) => x['en'],
        'No answer'
      )
    ).toEqual(expected);
  });
});
