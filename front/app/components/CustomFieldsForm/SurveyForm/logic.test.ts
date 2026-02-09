import { Pages } from '../util';

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
