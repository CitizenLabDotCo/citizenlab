import getVisiblePages from './getVisiblePages';

describe('getVisiblePages: no logic', () => {
  const pages = [
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: '850764eb-c21b-4bca-953a-067c5bab865d',
        title: '',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [
        {
          type: 'Control',
          scope: '#/properties/your_question_863',
          label: 'Your question',
          options: {
            description: '',
            input_type: 'select',
            isAdminField: false,
            hasRule: false,
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
        id: 'ce813081-ba17-4b1b-b5ac-e905a60b1dfa',
        title: '',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [],
    },
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: '74127e79-c37b-4a70-ab2a-84e3dc415174',
        title: 'Thank you for sharing your input!',
        description: 'Your input has been successfully submitted.',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [],
    },
  ] as any;

  it('shows all pages', () => {
    const visiblePages = getVisiblePages(pages, {}, [pages[0]]);
    expect(visiblePages).toEqual(pages);
  });
});

describe('getVisiblePages: only page logic', () => {
  const pages = [
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: '850764eb-c21b-4bca-953a-067c5bab865d',
        title: '',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [
        {
          type: 'Control',
          scope: '#/properties/your_question_863',
          label: 'Your question',
          options: {
            description: '',
            input_type: 'select',
            isAdminField: false,
            hasRule: false,
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
        id: 'ce813081-ba17-4b1b-b5ac-e905a60b1dfa',
        title: '',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [],
      ruleArray: [
        {
          effect: 'HIDE',
          condition: {
            type: 'HIDEPAGE',
            pageId: '850764eb-c21b-4bca-953a-067c5bab865d',
          },
        },
      ],
    },
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: '74127e79-c37b-4a70-ab2a-84e3dc415174',
        title: 'Thank you for sharing your input!',
        description: 'Your input has been successfully submitted.',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [],
    },
  ] as any;

  it('hides second page', () => {
    const visiblePages = getVisiblePages(pages, {}, [pages[0]]);

    expect(visiblePages).toEqual([pages[0], pages[2]]);
  });
});

describe('getVisiblePages: only question logic', () => {
  const pages = [
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: '850764eb-c21b-4bca-953a-067c5bab865d',
        title: 'Page 1',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [
        {
          type: 'Control',
          scope: '#/properties/your_question_863',
          label: 'Your question',
          options: {
            description: '',
            input_type: 'select',
            isAdminField: false,
            hasRule: true,
            dropdown_layout: false,
            enumNames: ['Option 1', 'Option 2', 'Option 3'],
          },
        },
      ],
    },
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: 'ce813081-ba17-4b1b-b5ac-e905a60b1dfa',
        title: 'Page 2',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [],
      ruleArray: [
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['option_1_a3j'],
            },
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['option_2_rc6'],
            },
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['no_answer'],
            },
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['option_3_8xi'],
            },
          },
        },
      ],
    },
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: '92efe486-aa43-47e8-8219-6e9d88f4038d',
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
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['option_2_rc6'],
            },
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['no_answer'],
            },
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['option_3_8xi'],
            },
          },
        },
      ],
    },
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: 'df90533b-ce0d-4f4c-ba73-e480969925e6',
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
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['no_answer'],
            },
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['option_3_8xi'],
            },
          },
        },
      ],
    },
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: '1bc44eaf-9e73-45ce-81c5-3185974e1a54',
        title: 'Page 5',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [],
      ruleArray: [
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
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
        id: '74127e79-c37b-4a70-ab2a-84e3dc415174',
        title: 'Thank you for sharing your input!',
        description: 'Your input has been successfully submitted.',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [],
    },
  ] as any;

  it('if option 1 selected: show pages 1, 3, 4, 5 and 6', () => {
    const visiblePages = getVisiblePages(
      pages,
      {
        your_question_863: 'option_1_a3j',
      },
      [pages[0]]
    );
    expect(visiblePages).toEqual([
      pages[0],
      pages[2],
      pages[3],
      pages[4],
      pages[5],
    ]);
  });

  it('if option 2 selected: show pages 1, 4, 5 and 6', () => {
    const visiblePages = getVisiblePages(
      pages,
      {
        your_question_863: 'option_2_rc6',
      },
      [pages[0]]
    );
    expect(visiblePages).toEqual([pages[0], pages[3], pages[4], pages[5]]);
  });

  it('if option 3 selected: show pages 1, 5 and 6', () => {
    const visiblePages = getVisiblePages(
      pages,
      {
        your_question_863: 'option_3_8xi',
      },
      [pages[0]]
    );
    expect(visiblePages).toEqual([pages[0], pages[4], pages[5]]);
  });

  it('if no answer selected: show only first and end page', () => {
    const visiblePages = getVisiblePages(pages, {}, [pages[0]]);
    expect(visiblePages).toEqual([pages[0], pages[5]]);
  });
});

describe('getVisiblePages: page and question logic conflict', () => {
  const pages = [
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: '850764eb-c21b-4bca-953a-067c5bab865d',
        title: '',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [
        {
          type: 'Control',
          scope: '#/properties/your_question_863',
          label: 'Your question',
          options: {
            description: '',
            input_type: 'select',
            isAdminField: false,
            hasRule: true,
            dropdown_layout: false,
            enumNames: ['Option 1', 'Option 2', 'Option 3'],
          },
        },
      ],
    },
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: 'ce813081-ba17-4b1b-b5ac-e905a60b1dfa',
        title: '',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [],
      ruleArray: [
        {
          effect: 'HIDE',
          condition: {
            type: 'HIDEPAGE',
            pageId: '850764eb-c21b-4bca-953a-067c5bab865d',
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['option_1_a3j'],
            },
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['option_2_rc6'],
            },
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['no_answer'],
            },
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['option_3_8xi'],
            },
          },
        },
      ],
    },
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: '92efe486-aa43-47e8-8219-6e9d88f4038d',
        title: '',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [],
      ruleArray: [
        {
          effect: 'HIDE',
          condition: {
            type: 'HIDEPAGE',
            pageId: '850764eb-c21b-4bca-953a-067c5bab865d',
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['option_2_rc6'],
            },
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['no_answer'],
            },
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['option_3_8xi'],
            },
          },
        },
      ],
    },
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: 'df90533b-ce0d-4f4c-ba73-e480969925e6',
        title: '',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [],
      ruleArray: [
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['no_answer'],
            },
          },
        },
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
            schema: {
              enum: ['option_3_8xi'],
            },
          },
        },
      ],
    },
    {
      type: 'Page',
      options: {
        input_type: 'page',
        id: '1bc44eaf-9e73-45ce-81c5-3185974e1a54',
        title: '',
        description: '',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [],
      ruleArray: [
        {
          effect: 'HIDE',
          condition: {
            scope: '#/properties/your_question_863',
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
        id: '74127e79-c37b-4a70-ab2a-84e3dc415174',
        title: 'Thank you for sharing your input!',
        description: 'Your input has been successfully submitted.',
        page_layout: 'default',
        map_config_id: null,
      },
      elements: [],
    },
  ] as any;

  it('if option 1 selected: show pages 1, 3, 4, 5 and 6', () => {
    const visiblePages = getVisiblePages(
      pages,
      {
        your_question_863: 'option_1_a3j',
      },
      [pages[0]]
    );
    expect(visiblePages).toEqual([
      pages[0],
      pages[2],
      pages[3],
      pages[4],
      pages[5],
    ]);
  });

  it('if option 2 selected: show pages 1, 4, 5 and 6', () => {
    const visiblePages = getVisiblePages(
      pages,
      {
        your_question_863: 'option_2_rc6',
      },
      [pages[0]]
    );
    expect(visiblePages).toEqual([pages[0], pages[3], pages[4], pages[5]]);
  });

  it('if option 3 selected: show pages 1, 5 and 6', () => {
    const visiblePages = getVisiblePages(
      pages,
      {
        your_question_863: 'option_3_8xi',
      },
      [pages[0]]
    );
    expect(visiblePages).toEqual([pages[0], pages[4], pages[5]]);
  });

  it('if no answer selected: show only first and end page', () => {
    const visiblePages = getVisiblePages(pages, {}, [pages[0]]);
    expect(visiblePages).toEqual([pages[0], pages[5]]);
  });
});

describe('getVisiblePages: extremely complex and convoluted logic', () => {
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
              enum: ['option_2_p3n'],
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
              enum: ['option_2_ylz'],
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
              enum: ['option_2_ylz'],
            },
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

  describe('On the first page', () => {
    it('if no answers given yet: it shows all pages except page 2 as visible', () => {
      const visiblePages = getVisiblePages(pages, {}, [pages[0]]);

      expect(visiblePages).toEqual([pages[0], pages[2], pages[3], pages[4]]);
    });

    it('if option 1 selected: it shows all pages as visible', () => {
      const visiblePages = getVisiblePages(
        pages,
        { your_question_cf8: 'option_1_f22' },
        [pages[0]]
      );
      expect(visiblePages).toEqual([
        pages[0],
        pages[1],
        pages[2],
        pages[3],
        pages[4],
      ]);
    });

    it('if option 2 selected: it shows all pages except page 2 as visible', () => {
      const visiblePages = getVisiblePages(
        pages,
        { your_question_cf8: 'option_2_p3n' },
        [pages[0]]
      );

      expect(visiblePages).toEqual([pages[0], pages[2], pages[3], pages[4]]);
    });
  });

  describe('Other steps in user journey', () => {
    it('if we reach page 3 after not answering on page 1: it shows all pages except page 2 as visible', () => {
      const visiblePages = getVisiblePages(pages, {}, [pages[0], pages[2]]);
      expect(visiblePages).toEqual([pages[0], pages[2], pages[3], pages[4]]);
    });

    it('if we reach page 3 after selecting option 2 on page 1: it shows all pages except page 2 as visible', () => {
      const visiblePages = getVisiblePages(
        pages,
        { your_question_cf8: 'option_2_p3n' },
        [pages[0], pages[2]]
      );

      expect(visiblePages).toEqual([pages[0], pages[2], pages[3], pages[4]]);
    });

    it('if we reach page 2 after selecting option 1 on page 1, and we do not select anything: it removes page 3', () => {
      const visiblePages = getVisiblePages(
        pages,
        { your_question_cf8: 'option_1_f22' },
        [pages[0], pages[1]]
      );
      expect(visiblePages).toEqual([pages[0], pages[1], pages[3], pages[4]]);
    });

    it('if we reach page 2 after selecting option 1 on page 1, and we select option 1: it includes all pages', () => {
      const visiblePages = getVisiblePages(
        pages,
        {
          your_question_cf8: 'option_1_f22',
          another_single_choice_nfi: 'option_1_xxx',
        },
        [pages[0], pages[1]]
      );
      expect(visiblePages).toEqual([
        pages[0],
        pages[1],
        pages[2],
        pages[3],
        pages[4],
      ]);
    });

    it('if we reach page 2 after selecting option 1 on page 1, and we select option 2: it removes page 3 and 4', () => {
      const visiblePages = getVisiblePages(
        pages,
        {
          your_question_cf8: 'option_1_f22',
          another_single_choice_nfi: 'option_2_ylz',
        },
        [pages[0], pages[1]]
      );
      expect(visiblePages).toEqual([pages[0], pages[1], pages[4]]);
    });

    it('if we reach page 4 after not answering on page 1, and clicking next page on page 3: it shows all pages except page 2 as visible', () => {
      const visiblePages = getVisiblePages(pages, {}, [
        pages[0],
        pages[2],
        pages[3],
      ]);
      expect(visiblePages).toEqual([pages[0], pages[2], pages[3], pages[4]]);
    });

    it('if we reach page 4 after selecting option 2 on page 1, and clicking next page on page 3: it shows all pages except page 2 as visible', () => {
      const visiblePages = getVisiblePages(
        pages,
        { your_question_cf8: 'option_2_p3n' },
        [pages[0], pages[2], pages[3]]
      );
      expect(visiblePages).toEqual([pages[0], pages[2], pages[3], pages[4]]);
    });
  });
});
