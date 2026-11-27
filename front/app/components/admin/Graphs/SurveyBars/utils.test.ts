import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

import { EMPTY_COLOR } from '../legendColors';
import { DEFAULT_CATEGORICAL_COLORS } from '../styling';

import { parseQuestionResult } from './utils';

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
      description: {},
      questionNumber: 1,
      pageNumber: 1,
      hidden: false,
      logic: {},
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
        logicFilterId: null,
        logic: {},
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
        logicFilterId: null,
        logic: {},
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
        logicFilterId: null,
        logic: {},
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
      hidden: false,
      totalResponseCount: 4,
      questionResponseCount: 4,
      totalPickCount: 8,
      description: {},
      questionNumber: 1,
      pageNumber: 1,
      logic: {},
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
        logicFilterId: null,
        logic: {},
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
        logicFilterId: null,
        logic: {},
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
        logicFilterId: null,
        logic: {},
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

describe('parseQuestionResult logic', () => {
  const localize = (multiloc: Record<string, string | undefined> | undefined) =>
    multiloc?.en ?? '';

  const result = (
    logic: ResultUngrouped['logic'],
    answers: ResultUngrouped['answers']
  ): ResultUngrouped => ({
    inputType: 'linear_scale',
    question: { en: 'Scale' },
    description: {},
    customFieldId: 'field-1',
    required: false,
    hidden: false,
    grouped: false,
    totalResponseCount: 3,
    totalPickCount: 3,
    questionResponseCount: 2,
    questionNumber: 1,
    pageNumber: 1,
    logic,
    answers,
    multilocs: {
      answer: {
        1: { title_multiloc: { en: 'One' } },
        2: { title_multiloc: { en: 'Two' } },
      },
    },
  });

  it('attaches the logic of each answer, using no_answer for the empty answer', () => {
    const parsed = parseQuestionResult(
      result(
        {
          answer: {
            1: { id: 'rule-1', nextPageNumber: 3, numQuestionsSkipped: 2 },
            no_answer: { id: 'rule-none', nextPageNumber: 4 },
          },
        },
        [
          { answer: 1, count: 1 },
          { answer: 2, count: 1 },
          { answer: null, count: 1 },
        ]
      ),
      ['#000'],
      localize,
      'No answer'
    );

    expect(
      parsed.map(({ label, logicFilterId, logic }) => ({
        label,
        logicFilterId,
        logic,
      }))
    ).toEqual([
      {
        label: 'One',
        logicFilterId: 'rule-1',
        logic: { id: 'rule-1', nextPageNumber: 3, numQuestionsSkipped: 2 },
      },
      { label: 'Two', logicFilterId: null, logic: undefined },
      {
        label: 'No answer',
        logicFilterId: 'rule-none',
        logic: { id: 'rule-none', nextPageNumber: 4 },
      },
    ]);
  });

  it('leaves out the no-answer row, and its logic, when everyone answered', () => {
    const parsed = parseQuestionResult(
      result({ answer: { no_answer: { id: 'rule-none' } } }, [
        { answer: 1, count: 3 },
        { answer: null, count: 0 },
      ]),
      ['#000'],
      localize,
      'No answer'
    );

    expect(parsed.map(({ logicFilterId }) => logicFilterId)).toEqual([null]);
  });

  it('has no logic when the result has none', () => {
    const parsed = parseQuestionResult(
      result(undefined, [{ answer: 1, count: 3 }]),
      ['#000'],
      localize,
      'No answer'
    );

    expect(parsed[0].logicFilterId).toBeNull();
    expect(parsed[0].logic).toBeUndefined();
  });
});
