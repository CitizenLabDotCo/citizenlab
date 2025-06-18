import { Pages } from '../util';

import { determineNextPageNumber, determinePreviousPageNumber } from './logic';

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

    const previousPageIndex = determinePreviousPageNumber({
      pages,
      currentPage: pages[2].page,
    });
    expect(previousPageIndex).toBe(0);
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

    const previousPageIndex = determinePreviousPageNumber({
      pages,
      currentPage: pages[1].page,
    });

    expect(previousPageIndex).toBe(0);

    const nextPageIndex2 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 'option2',
      },
    });
    expect(nextPageIndex2).toBe(2);

    const previousPageIndex2 = determinePreviousPageNumber({
      pages,
      currentPage: pages[2].page,
    });
    expect(previousPageIndex2).toBe(0);

    const nextPageIndex3 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 'option3',
      },
    });
    expect(nextPageIndex3).toBe(3);

    const previousPageIndex3 = determinePreviousPageNumber({
      pages,
      currentPage: pages[3].page,
    });
    expect(previousPageIndex3).toBe(0);
    const nextPageIndex4 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {},
    });
    expect(nextPageIndex4).toBe(4);

    const previousPageIndex4 = determinePreviousPageNumber({
      pages,
      currentPage: pages[4].page,
    });
    expect(previousPageIndex4).toBe(0);
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
    const previousPageIndex = determinePreviousPageNumber({
      pages,
      currentPage: pages[1].page,
    });
    expect(previousPageIndex).toBe(0);
    const nextPageIndex2 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: ['option2'],
      },
    });
    expect(nextPageIndex2).toBe(2);
    const previousPageIndex2 = determinePreviousPageNumber({
      pages,
      currentPage: pages[2].page,
    });
    expect(previousPageIndex2).toBe(0);
    const nextPageIndex3 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: ['option3'],
      },
    });
    expect(nextPageIndex3).toBe(3);
    const previousPageIndex3 = determinePreviousPageNumber({
      pages,
      currentPage: pages[3].page,
    });
    expect(previousPageIndex3).toBe(0);
    const nextPageIndex4 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {},
    });
    expect(nextPageIndex4).toBe(4);
    const previousPageIndex4 = determinePreviousPageNumber({
      pages,
      currentPage: pages[4].page,
    });
    expect(previousPageIndex4).toBe(0);
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
    const previousPageIndex = determinePreviousPageNumber({
      pages,
      currentPage: pages[1].page,
    });
    expect(previousPageIndex).toBe(0);
    const nextPageIndex2 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 2,
      },
    });
    expect(nextPageIndex2).toBe(2);
    const previousPageIndex2 = determinePreviousPageNumber({
      pages,
      currentPage: pages[2].page,
    });
    expect(previousPageIndex2).toBe(0);
    const nextPageIndex3 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 3,
      },
    });

    expect(nextPageIndex3).toBe(3);
    const previousPageIndex3 = determinePreviousPageNumber({
      pages,
      currentPage: pages[3].page,
    });
    expect(previousPageIndex3).toBe(0);
    const nextPageIndex4 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {},
    });
    expect(nextPageIndex4).toBe(4);
    const previousPageIndex4 = determinePreviousPageNumber({
      pages,
      currentPage: pages[4].page,
    });
    expect(previousPageIndex4).toBe(0);
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
    const previousPageIndex = determinePreviousPageNumber({
      pages,
      currentPage: pages[1].page,
    });
    expect(previousPageIndex).toBe(0);
    const nextPageIndex2 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 2,
      },
    });
    expect(nextPageIndex2).toBe(2);
    const previousPageIndex2 = determinePreviousPageNumber({
      pages,
      currentPage: pages[2].page,
    });
    expect(previousPageIndex2).toBe(0);
    const nextPageIndex3 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {
        question1: 3,
      },
    });

    expect(nextPageIndex3).toBe(3);
    const previousPageIndex3 = determinePreviousPageNumber({
      pages,
      currentPage: pages[3].page,
    });
    expect(previousPageIndex3).toBe(0);
    const nextPageIndex4 = determineNextPageNumber({
      pages,
      currentPage: pages[0].page,
      formData: {},
    });
    expect(nextPageIndex4).toBe(4);
    const previousPageIndex4 = determinePreviousPageNumber({
      pages,
      currentPage: pages[4].page,
    });
    expect(previousPageIndex4).toBe(0);
  });
});
