import {
  IFlatCustomField,
  IOptionsType,
  LogicType,
  QuestionRuleType,
} from 'api/custom_fields/types';

import { convertCustomFieldsToNestedPages, Pages } from '../util';

import {
  determineNextPageNumber,
  determinePreviousPageNumber,
  getValidPagePath,
  getSkippedPageIndices,
} from './logic';

const pages: Pages = [
  {
    page: {
      id: 'b5cb88cf-1bd9-45e0-a099-3cbdc7bd98c2',
      type: 'custom_field',
      key: 'page1',
      input_type: 'page',
      title_multiloc: {},
      required: false,
      answers_visible_to: 'moderators',
      show_as_filter: false,
      ordering: 0,
      enabled: true,
      created_at: '2025-06-16T18:14:48.455Z',
      updated_at: '2025-06-17T09:07:10.676Z',
      logic: {},
      random_option_ordering: false,
      include_in_printed_form: true,
      description_multiloc: {},
      page_layout: 'default',

      matrix_statements: [],
      options: [],
    },
    pageQuestions: [],
  },
  {
    page: {
      id: 'page2',
      type: 'custom_field',
      key: 'page2',
      input_type: 'page',
      title_multiloc: { en: '' },
      required: false,
      answers_visible_to: 'moderators',
      show_as_filter: false,
      ordering: 1,
      enabled: true,
      created_at: '',
      updated_at: '',
      logic: {},
      random_option_ordering: false,
      include_in_printed_form: true,
      description_multiloc: {},
      page_layout: 'default',
      matrix_statements: [],
      options: [],
    },
    pageQuestions: [],
  },
  {
    page: {
      id: 'page3',
      type: 'custom_field',
      key: 'page2',
      input_type: 'page',
      title_multiloc: { en: '' },
      required: false,
      answers_visible_to: 'moderators',
      show_as_filter: false,
      ordering: 1,
      enabled: true,
      created_at: '',
      updated_at: '',
      logic: {},
      random_option_ordering: false,
      include_in_printed_form: true,
      description_multiloc: {},
      page_layout: 'default',
      matrix_statements: [],
      options: [],
    },
    pageQuestions: [],
  },
  {
    page: {
      id: 'page4',
      type: 'custom_field',
      key: 'page2',
      input_type: 'page',
      title_multiloc: { en: '' },
      required: false,
      answers_visible_to: 'moderators',
      show_as_filter: false,
      ordering: 1,
      enabled: true,
      created_at: '',
      updated_at: '',
      logic: {},
      random_option_ordering: false,
      include_in_printed_form: true,
      description_multiloc: {},
      page_layout: 'default',
      matrix_statements: [],
      options: [],
    },
    pageQuestions: [],
  },
  {
    page: {
      id: 'page5',
      type: 'custom_field',
      key: 'page2',
      input_type: 'page',
      title_multiloc: { en: '' },
      required: false,
      answers_visible_to: 'moderators',
      show_as_filter: false,
      ordering: 1,
      enabled: true,
      created_at: '',
      updated_at: '',
      logic: {},
      random_option_ordering: false,
      include_in_printed_form: true,
      description_multiloc: {},
      page_layout: 'default',
      matrix_statements: [],
      options: [],
    },
    pageQuestions: [],
  },
];
describe('Survey form logic', () => {
  beforeEach(() => {
    // Reset the pages array before each test
    pages[0].page.logic = {};
    pages[0].pageQuestions = [];
  });
  it('should determine next and previous page number based on page logic', () => {
    pages[0].page.logic = {
      next_page_id: 'page3',
    };

    const nextPageIndex = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
    });
    expect(nextPageIndex).toBe(2);
  });

  it('should determine previous and next page number based on select question logic', () => {
    pages[0].pageQuestions = [
      {
        type: 'custom_field',
        id: 'question1',
        key: 'question1',
        input_type: 'select',
        options: [
          {
            id: 'option1',
            key: 'option1',
            title_multiloc: { en: 'Option 1' },
          },
          {
            id: 'option2',
            key: 'option2',
            title_multiloc: { en: 'Option 2' },
          },
          {
            id: 'option3',
            key: 'option3',
            title_multiloc: { en: 'Option 3' },
          },
        ],
        logic: {
          rules: [
            {
              if: 'option1',
              goto_page_id: 'page2',
            },
            {
              if: 'option2',
              goto_page_id: 'page3',
            },
            { if: 'any_other_answer', goto_page_id: 'page4' },
            { if: 'no_answer', goto_page_id: 'page5' },
          ],
        },
        title_multiloc: { en: '' },
        description_multiloc: {},
        required: false,
        answers_visible_to: 'moderators',
        show_as_filter: false,
        ordering: 0,
        enabled: true,
        created_at: '',
        updated_at: '',
      },
    ];

    const nextPageIndex = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 'option1',
      },
    });
    expect(nextPageIndex).toBe(1);

    const nextPageIndex2 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 'option2',
      },
    });
    expect(nextPageIndex2).toBe(2);

    const nextPageIndex3 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 'option3',
      },
    });
    expect(nextPageIndex3).toBe(3);

    const nextPageIndex4 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {},
    });
    expect(nextPageIndex4).toBe(4);
  });

  it('should determine previous and next page number based on multiselect question logic', () => {
    pages[0].pageQuestions = [
      {
        type: 'custom_field',
        id: 'question1',
        key: 'question1',
        input_type: 'multiselect',
        options: [
          {
            id: 'option1',
            key: 'option1',
            title_multiloc: { en: 'Option 1' },
          },
          {
            id: 'option2',
            key: 'option2',
            title_multiloc: { en: 'Option 2' },
          },
          {
            id: 'option3',
            key: 'option3',
            title_multiloc: { en: 'Option 3' },
          },
        ],
        logic: {
          rules: [
            {
              if: 'option1',
              goto_page_id: 'page2',
            },
            {
              if: 'option2',
              goto_page_id: 'page3',
            },
            { if: 'any_other_answer', goto_page_id: 'page4' },
            { if: 'no_answer', goto_page_id: 'page5' },
          ],
        },
        title_multiloc: { en: '' },
        description_multiloc: {},
        required: false,
        answers_visible_to: 'moderators',
        show_as_filter: false,
        ordering: 0,
        enabled: true,
        created_at: '',
        updated_at: '',
      },
    ];

    const nextPageIndex = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: ['option1'],
      },
    });
    expect(nextPageIndex).toBe(1);

    const nextPageIndex2 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: ['option2'],
      },
    });
    expect(nextPageIndex2).toBe(2);

    const nextPageIndex3 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: ['option3'],
      },
    });
    expect(nextPageIndex3).toBe(3);

    const nextPageIndex4 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {},
    });
    expect(nextPageIndex4).toBe(4);
  });

  it('determies previous and next page number based on linear scale question logic', () => {
    pages[0].pageQuestions = [
      {
        type: 'custom_field',
        id: 'question1',
        key: 'question1',
        input_type: 'linear_scale',
        maximum: 5,
        logic: {
          rules: [
            {
              if: 1,
              goto_page_id: 'page2',
            },
            {
              if: 2,
              goto_page_id: 'page3',
            },
            { if: 'any_other_answer', goto_page_id: 'page4' },
            { if: 'no_answer', goto_page_id: 'page5' },
          ],
        },
        title_multiloc: { en: '' },
        description_multiloc: {},
        required: false,
        answers_visible_to: 'moderators',
        show_as_filter: false,
        ordering: 0,
        enabled: true,
        created_at: '',
        updated_at: '',
      },
    ];

    const nextPageIndex = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 1,
      },
    });
    expect(nextPageIndex).toBe(1);

    const nextPageIndex2 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 2,
      },
    });
    expect(nextPageIndex2).toBe(2);

    const nextPageIndex3 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 3,
      },
    });

    expect(nextPageIndex3).toBe(3);

    const nextPageIndex4 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {},
    });
    expect(nextPageIndex4).toBe(4);
  });

  it('determies previous and next page number based on rating question logic', () => {
    pages[0].pageQuestions = [
      {
        type: 'custom_field',
        id: 'question1',
        key: 'question1',
        input_type: 'rating',
        maximum: 5,
        logic: {
          rules: [
            {
              if: 1,
              goto_page_id: 'page2',
            },
            {
              if: 2,
              goto_page_id: 'page3',
            },
            { if: 'any_other_answer', goto_page_id: 'page4' },
            { if: 'no_answer', goto_page_id: 'page5' },
          ],
        },
        title_multiloc: { en: '' },
        description_multiloc: {},
        required: false,
        answers_visible_to: 'moderators',
        show_as_filter: false,
        ordering: 0,
        enabled: true,
        created_at: '',
        updated_at: '',
      },
    ];

    const nextPageIndex = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 1,
      },
    });
    expect(nextPageIndex).toBe(1);

    const nextPageIndex2 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 2,
      },
    });
    expect(nextPageIndex2).toBe(2);

    const nextPageIndex3 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 3,
      },
    });

    expect(nextPageIndex3).toBe(3);

    const nextPageIndex4 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {},
    });
    expect(nextPageIndex4).toBe(4);
  });

  describe('Navigation history-based previous page determination', () => {
    it('should use navigation history when available', () => {
      // Simulate a path where user went from page 0 -> page 2 -> page 1 (through conditional logic)
      const userNavigationHistory = [0, 2, 1];
      const currentPageIndex = 1; // Currently on page 1

      const previousPageIndex = determinePreviousPageNumber({
        userNavigationHistory,
        currentPageIndex,
      });

      // Should return page 2 (the previous page in history), not page 0 (sequential previous)
      expect(previousPageIndex).toBe(2);
    });

    it('should fallback to logic-based approach when current page not in history', () => {
      const userNavigationHistory = [0, 2]; // History doesn't include current page
      const currentPageIndex = 1;

      const previousPageIndex = determinePreviousPageNumber({
        userNavigationHistory,
        currentPageIndex,
      });

      // Should fallback to original logic
      expect(previousPageIndex).toBe(0);
    });

    it('should fallback to logic-based approach when history has only one page', () => {
      const userNavigationHistory = [1]; // Only current page in history
      const currentPageIndex = 1;

      const previousPageIndex = determinePreviousPageNumber({
        userNavigationHistory,
        currentPageIndex,
      });

      // Should fallback to original logic
      expect(previousPageIndex).toBe(0);
    });

    it('should handle complex navigation paths correctly', () => {
      // Simulate: page 0 -> page 3 -> page 1 -> page 2 -> page 4
      const userNavigationHistory = [0, 3, 1, 2, 4];
      const currentPageIndex = 4;

      const previousPageIndex = determinePreviousPageNumber({
        userNavigationHistory,
        currentPageIndex,
      });

      // Should return page 2 (the actual previous page in user's path)
      expect(previousPageIndex).toBe(2);
    });

    it('should handle multiple visits to the same page', () => {
      // Simulate: page 0 -> page 1 -> page 2 -> page 1 (user went back and forth)
      const userNavigationHistory = [0, 1, 2, 1];
      const currentPageIndex = 1;

      const previousPageIndex = determinePreviousPageNumber({
        userNavigationHistory,
        currentPageIndex,
      });

      // Should return page 2 (the most recent previous page in history)
      expect(previousPageIndex).toBe(2);
    });
  });

  describe('Skipped pages logic', () => {
    beforeEach(() => {
      pages[0].page.logic = {};
      pages[0].pageQuestions = [
        {
          type: 'custom_field',
          id: 'q1',
          key: 'answer_q1',
          input_type: 'select',
          options: [
            { id: 'yes_option', key: 'yes', title_multiloc: { en: 'Yes' } },
            { id: 'no_option', key: 'no', title_multiloc: { en: 'No' } },
          ],
          logic: {
            rules: [
              { if: 'yes_option', goto_page_id: 'page2' },
              { if: 'no_option', goto_page_id: 'page3' },
            ],
          },
          title_multiloc: { en: 'Question 1' },
          description_multiloc: {},
          required: false,
          answers_visible_to: 'moderators',
          show_as_filter: false,
          ordering: 0,
          enabled: true,
          created_at: '',
          updated_at: '',
        },
      ];

      pages[1].page.logic = { next_page_id: 'page4' };
      pages[1].pageQuestions = [
        {
          type: 'custom_field',
          id: 'q2',
          key: 'answer_q2',
          input_type: 'text',
          logic: { rules: [] },
          title_multiloc: { en: 'Question 2' },
          description_multiloc: {},
          required: false,
          answers_visible_to: 'moderators',
          show_as_filter: false,
          ordering: 0,
          enabled: true,
          created_at: '',
          updated_at: '',
        },
      ];

      pages[2].page.logic = { next_page_id: 'page5' };
      pages[2].pageQuestions = [
        {
          type: 'custom_field',
          id: 'q3',
          key: 'answer_q3',
          input_type: 'text',
          logic: { rules: [] },
          title_multiloc: { en: 'Question 3' },
          description_multiloc: {},
          required: false,
          answers_visible_to: 'moderators',
          show_as_filter: false,
          ordering: 0,
          enabled: true,
          created_at: '',
          updated_at: '',
        },
      ];

      pages[3].page.logic = {};
      pages[3].pageQuestions = [];
    });

    it('should trace the valid path through conditional logic', () => {
      const validPathWhenYes = getValidPagePath({
        pages,
        formData: { answer_q1: 'yes' },
      });
      expect(validPathWhenYes).toEqual([0, 1, 3, 4]);

      const validPathWhenNo = getValidPagePath({
        pages,
        formData: { answer_q1: 'no' },
      });
      expect(validPathWhenNo).toEqual([0, 2, 4]);
    });

    it('should identify which pages are skipped based on current form data', () => {
      const skippedWhenYes = getSkippedPageIndices({
        pages,
        formData: { answer_q1: 'yes' },
      });
      expect(skippedWhenYes).toEqual([2]);

      const skippedWhenNo = getSkippedPageIndices({
        pages,
        formData: { answer_q1: 'no' },
      });
      expect(skippedWhenNo).toEqual([1, 3]);
    });
  });
});

const field = (
  attributes: Partial<IFlatCustomField> &
    Pick<IFlatCustomField, 'id' | 'input_type'>
): IFlatCustomField => ({
  type: 'custom_field',
  key: attributes.id,
  title_multiloc: { en: attributes.id },
  description_multiloc: {},
  required: false,
  answers_visible_to: 'moderators',
  show_as_filter: false,
  enabled: true,
  ordering: 0,
  created_at: '',
  updated_at: '',
  logic: {},
  ...attributes,
});

const pageField = (id: string, logic: LogicType = {}, key = id) =>
  field({ id, key, input_type: 'page', logic });

const endPage = () => pageField('page-end', {}, 'form_end');

// Option ids are UUIDs while answers hold option keys, as with real data.
const abcOptions = [
  { id: 'id-a', key: 'a', title_multiloc: { en: 'A' } },
  { id: 'id-b', key: 'b', title_multiloc: { en: 'B' } },
  { id: 'id-c', key: 'c', title_multiloc: { en: 'C' } },
];

const abcOptionsWithIdEqualToKey = abcOptions.map((option) => ({
  ...option,
  id: option.key,
}));

const nextPage = (
  pages: Pages,
  formData: Record<string, unknown>,
  pageIndex = 0
) =>
  determineNextPageNumber({
    pages,
    currentPage: pages[pageIndex].page,
    formData,
  });

describe('determineNextPageNumber edge cases', () => {
  describe('select', () => {
    const buildPages = (options: IOptionsType[], rules: QuestionRuleType[]) =>
      convertCustomFieldsToNestedPages([
        pageField('p1'),
        field({ id: 'q', input_type: 'select', options, logic: { rules } }),
        pageField('p2'),
        pageField('p3'),
        pageField('p4'),
        pageField('p5'),
        endPage(),
      ]);

    it('maps the answered option key to its id to match an explicit rule', () => {
      const pages = buildPages(abcOptions, [
        { if: 'id-a', goto_page_id: 'p3' },
      ]);

      expect(nextPage(pages, { q: 'a' })).toBe(2);
      expect(nextPage(pages, { q: 'b' })).toBe(1);
    });

    it('does not apply the any-other-answer rule when option ids differ from keys (current behaviour, B2)', () => {
      const pages = buildPages(abcOptions, [
        { if: 'id-a', goto_page_id: 'p3' },
        { if: 'any_other_answer', goto_page_id: 'p4' },
      ]);

      expect(nextPage(pages, { q: 'a' })).toBe(2);
      expect(nextPage(pages, { q: 'c' })).toBe(1);
    });

    it('applies the any-other-answer rule only when option ids equal keys', () => {
      const pages = buildPages(abcOptionsWithIdEqualToKey, [
        { if: 'a', goto_page_id: 'p3' },
        { if: 'any_other_answer', goto_page_id: 'p4' },
      ]);

      expect(nextPage(pages, { q: 'a' })).toBe(2);
      expect(nextPage(pages, { q: 'c' })).toBe(3);
    });

    it('applies the no-answer rule only when the question is unanswered', () => {
      const pages = buildPages(abcOptions, [
        { if: 'no_answer', goto_page_id: 'p5' },
      ]);

      expect(nextPage(pages, {})).toBe(4);
      expect(nextPage(pages, { q: undefined })).toBe(4);
      expect(nextPage(pages, { q: null })).toBe(4);
      expect(nextPage(pages, { q: '' })).toBe(4);
      expect(nextPage(pages, { q: 'a' })).toBe(1);
    });

    it('matches no rule for the key of an option that no longer exists (current behaviour, B15)', () => {
      const pages = buildPages(abcOptionsWithIdEqualToKey, [
        { if: 'a', goto_page_id: 'p3' },
        { if: 'any_other_answer', goto_page_id: 'p4' },
        { if: 'no_answer', goto_page_id: 'p5' },
      ]);

      expect(nextPage(pages, { q: 'deleted_option' })).toBe(1);
    });

    it('returns -1 when the rule target is not one of the pages (current behaviour, N4)', () => {
      const pages = buildPages(abcOptions, [
        { if: 'id-a', goto_page_id: 'disabled-page' },
      ]);

      expect(nextPage(pages, { q: 'a' })).toBe(-1);
    });

    it('returns -1 when a matching rule has no target page (current behaviour, N4)', () => {
      const pages = buildPages(abcOptions, [{ if: 'id-a', goto_page_id: '' }]);

      expect(nextPage(pages, { q: 'a' })).toBe(-1);
    });

    it('returns the last page index for a rule that jumps to the end page', () => {
      const pages = buildPages(abcOptions, [
        { if: 'id-a', goto_page_id: 'page-end' },
      ]);

      expect(nextPage(pages, { q: 'a' })).toBe(pages.length - 1);
    });
  });

  describe('page default next page', () => {
    const buildPages = (questionLogic: LogicType) =>
      convertCustomFieldsToNestedPages([
        pageField('p1', { next_page_id: 'p4' }),
        field({
          id: 'q',
          input_type: 'select',
          options: abcOptions,
          logic: questionLogic,
        }),
        pageField('p2'),
        pageField('p3'),
        pageField('p4'),
        endPage(),
      ]);

    it('follows the page default when no question on the page has rules', () => {
      expect(nextPage(buildPages({}), { q: 'a' })).toBe(3);
    });

    it('treats a question with an empty rules list as having no rules', () => {
      expect(nextPage(buildPages({ rules: [] }), { q: 'a' })).toBe(3);
    });

    it('lets a matching question rule override the page default', () => {
      const pages = buildPages({ rules: [{ if: 'id-a', goto_page_id: 'p3' }] });

      expect(nextPage(pages, { q: 'a' })).toBe(2);
    });

    it('goes to the sequential next page, ignoring the page default, when the question rules do not match (current behaviour, B6)', () => {
      const pages = buildPages({ rules: [{ if: 'id-a', goto_page_id: 'p3' }] });

      expect(nextPage(pages, { q: 'b' })).toBe(1);
      expect(nextPage(pages, {})).toBe(1);
    });
  });

  describe('several questions with rules on one page', () => {
    const buildPages = (
      firstRules: QuestionRuleType[],
      secondRules: QuestionRuleType[]
    ) =>
      convertCustomFieldsToNestedPages([
        pageField('p1'),
        field({
          id: 'q1',
          input_type: 'select',
          options: abcOptions,
          logic: { rules: firstRules },
        }),
        field({
          id: 'q2',
          input_type: 'select',
          options: abcOptions,
          logic: { rules: secondRules },
        }),
        pageField('p2'),
        pageField('p3'),
        pageField('p4'),
        endPage(),
      ]);

    it('uses the last matching question, even when its target is nearer', () => {
      const pages = buildPages(
        [{ if: 'id-a', goto_page_id: 'p4' }],
        [{ if: 'id-a', goto_page_id: 'p3' }]
      );

      expect(nextPage(pages, { q1: 'a', q2: 'a' })).toBe(2);
    });

    it('keeps an earlier match when a later question does not match', () => {
      const pages = buildPages(
        [{ if: 'id-a', goto_page_id: 'p4' }],
        [{ if: 'id-a', goto_page_id: 'p3' }]
      );

      expect(nextPage(pages, { q1: 'a', q2: 'b' })).toBe(3);
    });
  });

  describe('legacy multiselect', () => {
    const buildPages = (
      options: IOptionsType[],
      rules: QuestionRuleType[],
      inputType: 'multiselect' | 'multiselect_image' = 'multiselect'
    ) =>
      convertCustomFieldsToNestedPages([
        pageField('p1'),
        field({ id: 'q', input_type: inputType, options, logic: { rules } }),
        pageField('p2'),
        pageField('p3'),
        pageField('p4'),
        pageField('p5'),
        endPage(),
      ]);

    it.each(['multiselect', 'multiselect_image'] as const)(
      'goes to the farthest target when several selected %s options have rules',
      (inputType) => {
        const pages = buildPages(
          abcOptions,
          [
            { if: 'id-b', goto_page_id: 'p4' },
            { if: 'id-a', goto_page_id: 'p3' },
          ],
          inputType
        );

        expect(nextPage(pages, { q: ['a', 'b'] })).toBe(3);
        expect(nextPage(pages, { q: ['a'] })).toBe(2);
      }
    );

    it('does not apply the any-other-answer rule when option ids differ from keys (current behaviour, B2)', () => {
      const pages = buildPages(abcOptions, [
        { if: 'id-a', goto_page_id: 'p3' },
        { if: 'any_other_answer', goto_page_id: 'p4' },
      ]);

      expect(nextPage(pages, { q: ['c'] })).toBe(1);
      expect(nextPage(pages, { q: ['a', 'c'] })).toBe(2);
    });

    it('applies the any-other-answer rule when option ids equal keys', () => {
      const pages = buildPages(abcOptionsWithIdEqualToKey, [
        { if: 'a', goto_page_id: 'p3' },
        { if: 'any_other_answer', goto_page_id: 'p4' },
      ]);

      expect(nextPage(pages, { q: ['c'] })).toBe(3);
      expect(nextPage(pages, { q: ['a'] })).toBe(2);
      expect(nextPage(pages, { q: ['a', 'c'] })).toBe(3);
    });

    it('applies the no-answer rule to an empty selection', () => {
      const pages = buildPages(abcOptions, [
        { if: 'no_answer', goto_page_id: 'p5' },
      ]);

      expect(nextPage(pages, { q: [] })).toBe(4);
      expect(nextPage(pages, {})).toBe(4);
      expect(nextPage(pages, { q: ['a'] })).toBe(1);
    });
  });

  describe.each([
    ['linear_scale', ''],
    ['rating', ' (current behaviour, B1)'],
  ] as const)('%s%s', (inputType, _label) => {
    const buildPages = (rules: QuestionRuleType[]) =>
      convertCustomFieldsToNestedPages([
        pageField('p1'),
        field({ id: 'q', input_type: inputType, maximum: 5, logic: { rules } }),
        pageField('p2'),
        pageField('p3'),
        pageField('p4'),
        pageField('p5'),
        endPage(),
      ]);

    it('matches an integer rule value against an integer answer', () => {
      const pages = buildPages([{ if: 3, goto_page_id: 'p3' }]);

      expect(nextPage(pages, { q: 3 })).toBe(2);
      expect(nextPage(pages, { q: 2 })).toBe(1);
    });

    it('matches a string rule value against an integer answer (current behaviour, B14)', () => {
      const pages = buildPages([{ if: '3', goto_page_id: 'p3' }]);

      expect(nextPage(pages, { q: 3 })).toBe(2);
    });

    it('does not match an integer rule value against a string answer', () => {
      const pages = buildPages([{ if: 3, goto_page_id: 'p3' }]);

      expect(nextPage(pages, { q: '3' })).toBe(1);
    });

    it('applies the any-other-answer rule only to values without their own rule', () => {
      const pages = buildPages([
        { if: 3, goto_page_id: 'p3' },
        { if: 'any_other_answer', goto_page_id: 'p4' },
      ]);

      expect(nextPage(pages, { q: 3 })).toBe(2);
      expect(nextPage(pages, { q: 1 })).toBe(3);
      expect(nextPage(pages, { q: 5 })).toBe(3);
      expect(nextPage(pages, {})).toBe(1);
      expect(nextPage(pages, { q: null })).toBe(1);
    });

    it('does not apply the any-other-answer rule to values outside 1 to maximum', () => {
      const pages = buildPages([
        { if: 'any_other_answer', goto_page_id: 'p4' },
      ]);

      expect(nextPage(pages, { q: 6 })).toBe(1);
      expect(nextPage(pages, { q: 0 })).toBe(1);
    });

    it('goes to the farther target when a string rule value also leaves the value to the any-other-answer rule (current behaviour, B14)', () => {
      const pages = buildPages([
        { if: '3', goto_page_id: 'p3' },
        { if: 'any_other_answer', goto_page_id: 'p4' },
      ]);

      expect(nextPage(pages, { q: 3 })).toBe(3);
    });

    it('applies the no-answer rule to empty answers', () => {
      const pages = buildPages([{ if: 'no_answer', goto_page_id: 'p5' }]);

      expect(nextPage(pages, {})).toBe(4);
      expect(nextPage(pages, { q: null })).toBe(4);
      expect(nextPage(pages, { q: '' })).toBe(4);
      expect(nextPage(pages, { q: [] })).toBe(4);
      expect(nextPage(pages, { q: 1 })).toBe(1);
    });

    it('treats the value 0 as no answer', () => {
      const pages = buildPages([{ if: 'no_answer', goto_page_id: 'p5' }]);

      expect(nextPage(pages, { q: 0 })).toBe(4);
    });
  });

  describe('other input types', () => {
    const buildPages = (
      attributes: Partial<IFlatCustomField> &
        Pick<IFlatCustomField, 'input_type'>,
      rules: QuestionRuleType[]
    ) =>
      convertCustomFieldsToNestedPages([
        pageField('p1'),
        field({ id: 'q', ...attributes, logic: { rules } }),
        pageField('p2'),
        pageField('p3'),
        endPage(),
      ]);

    it('never matches a ranking rule on an option id, because answers hold ranked keys (current behaviour, B8)', () => {
      const pages = buildPages({ input_type: 'ranking', options: abcOptions }, [
        { if: 'id-a', goto_page_id: 'p3' },
      ]);

      expect(nextPage(pages, { q: ['a', 'b', 'c'] })).toBe(1);
      expect(nextPage(pages, { q: ['a'] })).toBe(1);
    });

    it('matches a ranking rule whose value equals the comma-joined ranked keys (current behaviour, B8)', () => {
      const pages = buildPages({ input_type: 'ranking', options: abcOptions }, [
        { if: 'a,b,c', goto_page_id: 'p3' },
      ]);

      expect(nextPage(pages, { q: ['a', 'b', 'c'] })).toBe(2);
    });

    it('matches a text rule by equality with the answer', () => {
      const pages = buildPages({ input_type: 'text' }, [
        { if: 'hello', goto_page_id: 'p3' },
      ]);

      expect(nextPage(pages, { q: 'hello' })).toBe(2);
      expect(nextPage(pages, { q: 'Hello' })).toBe(1);
    });

    it('matches a string rule value against a number answer but not the other way round', () => {
      const withStringRule = buildPages({ input_type: 'number' }, [
        { if: '5', goto_page_id: 'p3' },
      ]);
      const withIntegerRule = buildPages({ input_type: 'number' }, [
        { if: 5, goto_page_id: 'p3' },
      ]);

      expect(nextPage(withStringRule, { q: 5 })).toBe(2);
      expect(nextPage(withIntegerRule, { q: '5' })).toBe(1);
    });

    it('applies the no-answer rule to any input type', () => {
      const pages = buildPages({ input_type: 'multiline_text' }, [
        { if: 'no_answer', goto_page_id: 'p3' },
      ]);

      expect(nextPage(pages, { q: '' })).toBe(2);
      expect(nextPage(pages, { q: 'text' })).toBe(1);
    });
  });
});

describe('getValidPagePath and getSkippedPageIndices edge cases', () => {
  const selectOn = (id: string, rules: QuestionRuleType[]) =>
    field({ id, input_type: 'select', options: abcOptions, logic: { rules } });

  it('stops the path at a page whose rule targets a page that is not in the form (current behaviour, N4)', () => {
    const pages = convertCustomFieldsToNestedPages([
      pageField('p1'),
      selectOn('q', [{ if: 'id-a', goto_page_id: 'disabled-page' }]),
      pageField('p2'),
      pageField('p3'),
      endPage(),
    ]);

    expect(getValidPagePath({ pages, formData: { q: 'a' } })).toEqual([0]);
    expect(getSkippedPageIndices({ pages, formData: { q: 'a' } })).toEqual([
      1, 2, 3,
    ]);
  });

  it('stops the path at a page whose rule targets an earlier page', () => {
    const pages = convertCustomFieldsToNestedPages([
      pageField('p1'),
      pageField('p2'),
      selectOn('q', [{ if: 'id-a', goto_page_id: 'p1' }]),
      pageField('p3'),
      endPage(),
    ]);

    expect(nextPage(pages, { q: 'a' }, 1)).toBe(0);
    expect(getValidPagePath({ pages, formData: { q: 'a' } })).toEqual([0, 1]);
    expect(getSkippedPageIndices({ pages, formData: { q: 'a' } })).toEqual([
      2, 3,
    ]);
  });

  it('stops the path at a page whose rule targets itself', () => {
    const pages = convertCustomFieldsToNestedPages([
      pageField('p1'),
      selectOn('q', [{ if: 'id-a', goto_page_id: 'p1' }]),
      pageField('p2'),
      endPage(),
    ]);

    expect(nextPage(pages, { q: 'a' })).toBe(0);
    expect(getValidPagePath({ pages, formData: { q: 'a' } })).toEqual([0]);
  });

  it('stops the path at a page whose default next page is earlier', () => {
    const pages = convertCustomFieldsToNestedPages([
      pageField('p1'),
      pageField('p2', { next_page_id: 'p1' }),
      pageField('p3'),
      endPage(),
    ]);

    expect(getValidPagePath({ pages })).toEqual([0, 1]);
  });

  it('skips every page between a jump to the end page and the end page', () => {
    const pages = convertCustomFieldsToNestedPages([
      pageField('p1'),
      selectOn('q', [{ if: 'id-a', goto_page_id: 'page-end' }]),
      pageField('p2'),
      pageField('p3'),
      endPage(),
    ]);

    expect(getValidPagePath({ pages, formData: { q: 'a' } })).toEqual([0, 3]);
    expect(getSkippedPageIndices({ pages, formData: { q: 'a' } })).toEqual([
      1, 2,
    ]);
  });

  it('can jump to a user fields page placed before the end page', () => {
    const pages = convertCustomFieldsToNestedPages([
      pageField('p1'),
      selectOn('q', [{ if: 'id-a', goto_page_id: 'random-user-page-id' }]),
      pageField('p2'),
      pageField('random-user-page-id', {}, 'user_page'),
      field({ id: 'u_gender', input_type: 'select', options: abcOptions }),
      endPage(),
    ]);

    expect(nextPage(pages, { q: 'a' })).toBe(2);
    expect(getValidPagePath({ pages, formData: { q: 'a' } })).toEqual([
      0, 2, 3,
    ]);
  });

  it('updates the skipped pages when an answer changes', () => {
    const pages = convertCustomFieldsToNestedPages([
      pageField('p1'),
      selectOn('q1', [
        { if: 'id-a', goto_page_id: 'p3' },
        { if: 'id-b', goto_page_id: 'p4' },
      ]),
      pageField('p2'),
      field({ id: 'q2', input_type: 'text' }),
      pageField('p3', { next_page_id: 'page-end' }),
      field({ id: 'q3', input_type: 'text' }),
      pageField('p4'),
      field({ id: 'q4', input_type: 'text' }),
      endPage(),
    ]);

    expect(getSkippedPageIndices({ pages, formData: {} })).toEqual([3]);
    expect(
      getSkippedPageIndices({ pages, formData: { q1: 'a', q3: 'x' } })
    ).toEqual([1, 3]);
    expect(
      getSkippedPageIndices({ pages, formData: { q1: 'b', q3: 'x' } })
    ).toEqual([1, 2]);
  });
});
