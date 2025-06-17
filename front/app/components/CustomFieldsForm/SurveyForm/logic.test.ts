import { Pages } from '../util';

import { determineNextPageNumber, determinePreviousPageNumber } from './logic';

describe('Survey form logic', () => {
  it('should determine next and previous page number based on page logic', () => {
    const pages: Pages = [
      {
        page: {
          id: 'page1',
          type: 'custom_field',
          key: 'page1',
          input_type: 'page',
          title_multiloc: {},
          required: false,
          ordering: 0,
          enabled: true,
          created_at: '2025-06-16T18:14:48.455Z',
          updated_at: '2025-06-17T09:07:10.676Z',
          logic: {
            next_page_id: 'page3',
          },
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
          title_multiloc: {
            en: '',
          },
          required: false,
          ordering: 1,
          enabled: true,
          code: undefined,
          created_at: '2025-06-16T18:14:48.489Z',
          updated_at: '2025-06-17T09:07:10.680Z',
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
          key: 'page3',
          input_type: 'page',
          title_multiloc: {
            en: '',
          },
          required: false,
          ordering: 2,
          enabled: true,
          created_at: '2025-06-17T07:18:34.364Z',
          updated_at: '2025-06-17T09:07:10.684Z',
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
          id: 'ffab13ea-ea68-48a8-8dd8-59598cff0dfa',
          type: 'custom_field',
          key: 'form_end',
          input_type: 'page',
          title_multiloc: {
            en: 'Thank you for sharing your input!',
            'fr-BE': 'Merci pour votre participation !',
            'nl-BE': 'Bedankt voor het delen van je bijdrage!',
          },
          required: false,
          ordering: 3,
          enabled: true,
          created_at: '2025-06-16T18:14:48.496Z',
          updated_at: '2025-06-17T09:07:10.687Z',
          logic: {},
          random_option_ordering: false,
          include_in_printed_form: false,
          description_multiloc: {
            en: 'Your input has been successfully submitted.',
            'fr-BE': 'Votre contribution a été soumise avec succès.',
            'nl-BE': 'Je bijdrage is succesvol ingediend.',
          },
          page_layout: 'default',
          page_button_link: '',
          page_button_label_multiloc: {},

          matrix_statements: [],
          options: [],
        },
        pageQuestions: [],
      },
    ];

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
        pageQuestions: [
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
        ],
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
          description_multiloc: {}, // Assuming this is
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
          description_multiloc: {}, // Assuming this is
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
        pageQuestions: [
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
        ],
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
          description_multiloc: {}, // Assuming this is
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
          description_multiloc: {}, // Assuming this is
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
});
