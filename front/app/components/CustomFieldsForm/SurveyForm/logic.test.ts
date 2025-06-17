import { Pages } from '../util';

import { determineNextPageNumber, determinePreviousPageNumber } from './logic';

describe('Survey form logic', () => {
  it('should determine next and previous page number based on logic', () => {
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
          logic: {
            next_page_id: '9cd3d153-333d-4a91-87ea-dfe1b0beb72e',
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
          id: 'ccc3b3e5-5631-47d5-984b-11ed24c0a02a',
          type: 'custom_field',
          key: 'page1',
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
          id: '9cd3d153-333d-4a91-87ea-dfe1b0beb72e',
          type: 'custom_field',
          key: 'page2',

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
});
