import getVisiblePages from './getVisiblePages';

const pages = [
  {
    type: 'Page',
    options: {
      input_type: 'page',
      id: 'd99d4aaf-0b15-4b49-b9dc-58be06c6656c',
      title: '',
      description: '',
      page_layout: 'default',
      map_config_id: null,
    },
    elements: [
      {
        type: 'Control',
        scope: '#/properties/your_question_cf8',
        label: 'Your question',
        options: {
          description: '',
          input_type: 'select',
          isAdminField: false,
          hasRule: true,
          dropdown_layout: false,
          enumNames: ['Option 1', 'Option 2'],
        },
      },
    ],
  },
  {
    type: 'Page',
    options: {
      input_type: 'page',
      id: '7e39d151-59c5-4a78-9b88-30cabbd200ca',
      title: 'Page 2',
      description: '',
      page_layout: 'default',
      map_config_id: null,
    },
    elements: [
      {
        type: 'Control',
        scope: '#/properties/another_single_choice_nfi',
        label: 'Another single choice',
        options: {
          description: '',
          input_type: 'select',
          isAdminField: false,
          hasRule: true,
          dropdown_layout: false,
          enumNames: ['Option 1', 'Option 2'],
        },
      },
    ],
    ruleArray: [
      {
        effect: 'HIDE',
        condition: {
          scope: '#/properties/your_question_cf8',
          schema: {
            enum: ['option_2_r7u'],
          },
        },
      },
      {
        effect: 'HIDE',
        condition: {
          scope: '#/properties/your_question_cf8',
          schema: {
            enum: ['no_answer'],
          },
        },
      },
    ],
  },
  {
    type: 'Page',
    options: {
      input_type: 'page',
      id: '1dac0123-3bd6-454a-b12f-4c4e59945b4c',
      title: 'Page 3',
      description: '',
      page_layout: 'default',
      map_config_id: null,
    },
    elements: [],
    ruleArray: [
      {
        effect: 'HIDE',
        condition: {
          scope: '#/properties/another_single_choice_nfi',
          schema: {
            enum: ['no_answer'],
          },
        },
      },
      {
        effect: 'HIDE',
        condition: {
          scope: '#/properties/another_single_choice_nfi',
          schema: {
            enum: ['option_2_cfu'],
          },
        },
      },
    ],
  },
  {
    type: 'Page',
    options: {
      input_type: 'page',
      id: 'c5e6be59-54dd-4a24-851a-ee8dad15ac5a',
      title: 'Page 4',
      description: '',
      page_layout: 'default',
      map_config_id: null,
    },
    elements: [],
    ruleArray: [
      {
        effect: 'HIDE',
        condition: {
          scope: '#/properties/another_single_choice_nfi',
          schema: {
            enum: ['option_2_cfu'],
          },
        },
      },
      {
        effect: 'HIDE',
        condition: {
          type: 'HIDEPAGE',
          pageId: '1dac0123-3bd6-454a-b12f-4c4e59945b4c',
        },
      },
    ],
  },
  {
    type: 'Page',
    options: {
      input_type: 'page',
      id: '47e3750c-29ef-4d00-ac12-33f6ee58960b',
      title: 'Thank you for sharing your input!',
      description: 'Your input has been successfully submitted.',
      page_layout: 'default',
      map_config_id: null,
    },
    elements: [],
  },
] as any;

describe('getVisiblePages', () => {
  describe('On the first page', () => {
    it.only('if no answers given yet: shows page 1 and 3 as visible, but not page 2', () => {
      const visiblePages = getVisiblePages(pages, {});
      expect(visiblePages[0]).toEqual(pages[0]);
      expect(visiblePages[1]).toEqual(pages[2]);
    });

    it('if option 1 selected: shows page 1, 2 and 3 as visible', () => {
      const visiblePages = getVisiblePages(pages, { your_question_cf8: '' });
      expect(visiblePages[0]).toEqual(pages[0]);
      expect(visiblePages[1]).toEqual(pages[1]);
      expect(visiblePages[2]).toEqual(pages[2]);
    });

    it('if option 2 selected: shows page 1 and 3 as visible, but not page 2', () => {
      const visiblePages = getVisiblePages(pages, { your_question_cf8: '' });
      expect(visiblePages[0]).toEqual(pages[0]);
      expect(visiblePages[1]).toEqual(pages[2]);
    });
  });
});
