import { constructFlatCustomFields } from './constructFlatCustomFields';
import { ICustomFields } from './types';

describe('constructFlatCustomFields', () => {
  it('should construct flat custom fields correctly', () => {
    const customFieldsResponse = {
      data: [
        {
          id: '2810e71c-4b31-44bc-aea8-1b48fbccf7e9',
          type: 'custom_field',
          attributes: {
            key: 'page1',
            input_type: 'page',
            title_multiloc: {},
            required: false,
            ordering: 0,
            enabled: true,
            code: null,
            created_at: '2025-12-19T16:48:55.393Z',
            updated_at: '2025-12-19T16:48:55.393Z',
            logic: {},
            random_option_ordering: false,
            include_in_printed_form: true,
            description_multiloc: {},
            page_layout: 'default',
            constraints: {},
          },
          relationships: {
            options: {
              data: [],
            },
            resource: {
              data: {
                id: 'e2efbf22-73af-4be8-9816-63f6b2c47026',
                type: 'custom_form',
              },
            },
            map_config: {
              data: null,
            },
          },
        },
        {
          id: '38461da4-1d1e-4ef0-8794-d831e01ffe70',
          type: 'custom_field',
          attributes: {
            key: 'your_question_zkw',
            input_type: 'select',
            title_multiloc: {
              en: 'Your question',
              'fr-BE': 'Votre question',
              'nl-BE': 'Jouw vraag',
            },
            required: false,
            ordering: 1,
            enabled: true,
            code: null,
            created_at: '2025-12-19T16:48:55.411Z',
            updated_at: '2025-12-19T16:48:55.411Z',
            logic: {},
            random_option_ordering: false,
            include_in_printed_form: true,
            description_multiloc: {},
            dropdown_layout: false,
            constraints: {},
          },
          relationships: {
            options: {
              data: [
                {
                  id: 'bfc1d241-a0a3-47b6-bb05-d5ff9c7c9b6f',
                  type: 'custom_field_option',
                },
                {
                  id: 'b9d82a7f-5830-4d0e-8133-74769154d25a',
                  type: 'custom_field_option',
                },
              ],
            },
            resource: {
              data: {
                id: 'e2efbf22-73af-4be8-9816-63f6b2c47026',
                type: 'custom_form',
              },
            },
          },
        },
        {
          id: '143e7973-254f-473f-ad34-02f3d460f28c',
          type: 'custom_field',
          attributes: {
            key: 'image_q_v0e',
            input_type: 'multiselect_image',
            title_multiloc: {
              en: 'Image q',
              'fr-BE': 'Image q',
              'nl-BE': 'Image q',
            },
            required: false,
            ordering: 2,
            enabled: true,
            code: null,
            created_at: '2025-12-19T16:48:55.525Z',
            updated_at: '2025-12-19T16:48:55.525Z',
            logic: {
              rules: [],
            },
            random_option_ordering: false,
            include_in_printed_form: true,
            description_multiloc: {},
            constraints: {},
            select_count_enabled: false,
            maximum_select_count: null,
            minimum_select_count: null,
          },
          relationships: {
            options: {
              data: [
                {
                  id: '4eb71251-93e4-4dd6-9d84-ebc1c3c4e1b6',
                  type: 'custom_field_option',
                },
                {
                  id: 'f9968174-0d17-4e21-9ede-51d210ba556e',
                  type: 'custom_field_option',
                },
              ],
            },
            resource: {
              data: {
                id: 'e2efbf22-73af-4be8-9816-63f6b2c47026',
                type: 'custom_form',
              },
            },
          },
        },
        {
          id: '26a8e287-12a4-4009-823c-3341bbc37af1',
          type: 'custom_field',
          attributes: {
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
            code: null,
            created_at: '2025-12-19T16:48:55.666Z',
            updated_at: '2025-12-19T16:48:55.666Z',
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
            constraints: {},
          },
          relationships: {
            options: {
              data: [],
            },
            resource: {
              data: {
                id: 'e2efbf22-73af-4be8-9816-63f6b2c47026',
                type: 'custom_form',
              },
            },
            map_config: {
              data: null,
            },
          },
        },
      ],
      included: [
        {
          id: 'e2efbf22-73af-4be8-9816-63f6b2c47026',
          type: 'custom_form',
          attributes: {
            fields_last_updated_at: '2025-12-19T16:48:55.700Z',
            print_start_multiloc: {},
            print_end_multiloc: {},
            print_personal_data_fields: false,
            opened_at: '2025-12-19T17:44:14.420Z',
          },
        },
        {
          id: 'bfc1d241-a0a3-47b6-bb05-d5ff9c7c9b6f',
          type: 'custom_field_option',
          attributes: {
            key: 'option1',
            title_multiloc: {
              en: 'Option 1',
              'fr-BE': 'Option 1',
              'nl-BE': 'Optie 1',
            },
            ordering: 0,
            other: false,
            created_at: '2025-12-19T16:48:55.421Z',
            updated_at: '2025-12-19T16:48:55.421Z',
          },
          relationships: {
            image: {
              data: null,
            },
          },
        },
        {
          id: 'b9d82a7f-5830-4d0e-8133-74769154d25a',
          type: 'custom_field_option',
          attributes: {
            key: 'option2',
            title_multiloc: {
              en: 'Option 2',
              'fr-BE': 'Option 2',
              'nl-BE': 'Optie 2',
            },
            ordering: 1,
            other: false,
            created_at: '2025-12-19T16:48:55.481Z',
            updated_at: '2025-12-19T16:48:55.481Z',
          },
          relationships: {
            image: {
              data: null,
            },
          },
        },
        {
          id: '9d36caf5-7ae9-4b27-a858-46ad82669802',
          type: 'image',
          attributes: {
            ordering: 0,
            created_at: '2025-12-19T16:48:35.084Z',
            updated_at: '2025-12-19T16:48:55.636Z',
            versions: {
              small:
                'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/9d36caf5-7ae9-4b27-a858-46ad82669802/small_ede2851c-833b-46a2-9097-e7a86feaa058.png',
              medium:
                'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/9d36caf5-7ae9-4b27-a858-46ad82669802/medium_ede2851c-833b-46a2-9097-e7a86feaa058.png',
              large:
                'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/9d36caf5-7ae9-4b27-a858-46ad82669802/large_ede2851c-833b-46a2-9097-e7a86feaa058.png',
              fb: 'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/9d36caf5-7ae9-4b27-a858-46ad82669802/fb_ede2851c-833b-46a2-9097-e7a86feaa058.png',
            },
          },
        },
        {
          id: '4eb71251-93e4-4dd6-9d84-ebc1c3c4e1b6',
          type: 'custom_field_option',
          attributes: {
            key: 'option_1_yr4',
            title_multiloc: {
              en: 'Option 1',
              'fr-BE': 'Option 1',
              'nl-BE': 'Option 1',
            },
            ordering: 0,
            other: false,
            created_at: '2025-12-19T16:48:55.563Z',
            updated_at: '2025-12-19T16:48:55.563Z',
          },
          relationships: {
            image: {
              data: {
                id: '9d36caf5-7ae9-4b27-a858-46ad82669802',
                type: 'image',
              },
            },
          },
        },
        {
          id: '99a74890-dcc0-4038-811e-40b444799447',
          type: 'image',
          attributes: {
            ordering: 0,
            created_at: '2025-12-19T16:48:42.984Z',
            updated_at: '2025-12-19T16:48:55.654Z',
            versions: {
              small:
                'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/99a74890-dcc0-4038-811e-40b444799447/small_faf54a9b-8b3a-414b-8e15-689de9e362dc.png',
              medium:
                'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/99a74890-dcc0-4038-811e-40b444799447/medium_faf54a9b-8b3a-414b-8e15-689de9e362dc.png',
              large:
                'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/99a74890-dcc0-4038-811e-40b444799447/large_faf54a9b-8b3a-414b-8e15-689de9e362dc.png',
              fb: 'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/99a74890-dcc0-4038-811e-40b444799447/fb_faf54a9b-8b3a-414b-8e15-689de9e362dc.png',
            },
          },
        },
        {
          id: 'f9968174-0d17-4e21-9ede-51d210ba556e',
          type: 'custom_field_option',
          attributes: {
            key: 'option_2_wfe',
            title_multiloc: {
              en: 'Option 2',
              'fr-BE': 'Option 2',
              'nl-BE': 'Option 2',
            },
            ordering: 1,
            other: false,
            created_at: '2025-12-19T16:48:55.644Z',
            updated_at: '2025-12-19T16:48:55.644Z',
          },
          relationships: {
            image: {
              data: {
                id: '99a74890-dcc0-4038-811e-40b444799447',
                type: 'image',
              },
            },
          },
        },
      ],
    } as unknown as ICustomFields; // TODO: actually make this type correct

    const expectedFlatCustomFields = [
      {
        id: '2810e71c-4b31-44bc-aea8-1b48fbccf7e9',
        type: 'custom_field',
        attributes: {
          key: 'page1',
          input_type: 'page',
          title_multiloc: {},
          required: false,
          ordering: 0,
          enabled: true,
          code: null,
          created_at: '2025-12-19T16:48:55.393Z',
          updated_at: '2025-12-19T16:48:55.393Z',
          logic: {},
          random_option_ordering: false,
          include_in_printed_form: true,
          description_multiloc: {},
          page_layout: 'default',
          constraints: {},
        },
        relationships: {
          options: {
            data: [],
          },
          resource: {
            data: {
              id: 'e2efbf22-73af-4be8-9816-63f6b2c47026',
              type: 'custom_form',
            },
          },
          map_config: {
            data: null,
          },
        },
        key: 'page1',
        input_type: 'page',
        title_multiloc: {},
        required: false,
        ordering: 0,
        enabled: true,
        code: null,
        created_at: '2025-12-19T16:48:55.393Z',
        updated_at: '2025-12-19T16:48:55.393Z',
        logic: {},
        random_option_ordering: false,
        include_in_printed_form: true,
        description_multiloc: {},
        page_layout: 'default',
        constraints: {},
        map_config: {
          data: null,
        },
        options: [],
        matrix_statements: [],
      },
      {
        id: '38461da4-1d1e-4ef0-8794-d831e01ffe70',
        type: 'custom_field',
        attributes: {
          key: 'your_question_zkw',
          input_type: 'select',
          title_multiloc: {
            en: 'Your question',
            'fr-BE': 'Votre question',
            'nl-BE': 'Jouw vraag',
          },
          required: false,
          ordering: 1,
          enabled: true,
          code: null,
          created_at: '2025-12-19T16:48:55.411Z',
          updated_at: '2025-12-19T16:48:55.411Z',
          logic: {},
          random_option_ordering: false,
          include_in_printed_form: true,
          description_multiloc: {},
          dropdown_layout: false,
          constraints: {},
        },
        relationships: {
          options: {
            data: [
              {
                id: 'bfc1d241-a0a3-47b6-bb05-d5ff9c7c9b6f',
                type: 'custom_field_option',
              },
              {
                id: 'b9d82a7f-5830-4d0e-8133-74769154d25a',
                type: 'custom_field_option',
              },
            ],
          },
          resource: {
            data: {
              id: 'e2efbf22-73af-4be8-9816-63f6b2c47026',
              type: 'custom_form',
            },
          },
        },
        key: 'your_question_zkw',
        input_type: 'select',
        title_multiloc: {
          en: 'Your question',
          'fr-BE': 'Votre question',
          'nl-BE': 'Jouw vraag',
        },
        required: false,
        ordering: 1,
        enabled: true,
        code: null,
        created_at: '2025-12-19T16:48:55.411Z',
        updated_at: '2025-12-19T16:48:55.411Z',
        logic: {},
        random_option_ordering: false,
        include_in_printed_form: true,
        description_multiloc: {},
        dropdown_layout: false,
        constraints: {},
        options: [
          {
            id: 'bfc1d241-a0a3-47b6-bb05-d5ff9c7c9b6f',
            key: 'option1',
            title_multiloc: {
              en: 'Option 1',
              'fr-BE': 'Option 1',
              'nl-BE': 'Optie 1',
            },
            other: false,
          },
          {
            id: 'b9d82a7f-5830-4d0e-8133-74769154d25a',
            key: 'option2',
            title_multiloc: {
              en: 'Option 2',
              'fr-BE': 'Option 2',
              'nl-BE': 'Optie 2',
            },
            other: false,
          },
        ],
        matrix_statements: [],
      },
      {
        id: '143e7973-254f-473f-ad34-02f3d460f28c',
        type: 'custom_field',
        attributes: {
          key: 'image_q_v0e',
          input_type: 'multiselect_image',
          title_multiloc: {
            en: 'Image q',
            'fr-BE': 'Image q',
            'nl-BE': 'Image q',
          },
          required: false,
          ordering: 2,
          enabled: true,
          code: null,
          created_at: '2025-12-19T16:48:55.525Z',
          updated_at: '2025-12-19T16:48:55.525Z',
          logic: {
            rules: [],
          },
          random_option_ordering: false,
          include_in_printed_form: true,
          description_multiloc: {},
          constraints: {},
          select_count_enabled: false,
          maximum_select_count: null,
          minimum_select_count: null,
        },
        relationships: {
          options: {
            data: [
              {
                id: '4eb71251-93e4-4dd6-9d84-ebc1c3c4e1b6',
                type: 'custom_field_option',
              },
              {
                id: 'f9968174-0d17-4e21-9ede-51d210ba556e',
                type: 'custom_field_option',
              },
            ],
          },
          resource: {
            data: {
              id: 'e2efbf22-73af-4be8-9816-63f6b2c47026',
              type: 'custom_form',
            },
          },
        },
        key: 'image_q_v0e',
        input_type: 'multiselect_image',
        title_multiloc: {
          en: 'Image q',
          'fr-BE': 'Image q',
          'nl-BE': 'Image q',
        },
        required: false,
        ordering: 2,
        enabled: true,
        code: null,
        created_at: '2025-12-19T16:48:55.525Z',
        updated_at: '2025-12-19T16:48:55.525Z',
        logic: {
          rules: [],
        },
        random_option_ordering: false,
        include_in_printed_form: true,
        description_multiloc: {},
        constraints: {},
        select_count_enabled: false,
        maximum_select_count: null,
        minimum_select_count: null,
        options: [
          {
            id: '4eb71251-93e4-4dd6-9d84-ebc1c3c4e1b6',
            key: 'option_1_yr4',
            title_multiloc: {
              en: 'Option 1',
              'fr-BE': 'Option 1',
              'nl-BE': 'Option 1',
            },
            other: false,
            image_id: '9d36caf5-7ae9-4b27-a858-46ad82669802',
            image: {
              id: '9d36caf5-7ae9-4b27-a858-46ad82669802',
              type: 'image',
              attributes: {
                ordering: 0,
                created_at: '2025-12-19T16:48:35.084Z',
                updated_at: '2025-12-19T16:48:55.636Z',
                versions: {
                  small:
                    'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/9d36caf5-7ae9-4b27-a858-46ad82669802/small_ede2851c-833b-46a2-9097-e7a86feaa058.png',
                  medium:
                    'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/9d36caf5-7ae9-4b27-a858-46ad82669802/medium_ede2851c-833b-46a2-9097-e7a86feaa058.png',
                  large:
                    'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/9d36caf5-7ae9-4b27-a858-46ad82669802/large_ede2851c-833b-46a2-9097-e7a86feaa058.png',
                  fb: 'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/9d36caf5-7ae9-4b27-a858-46ad82669802/fb_ede2851c-833b-46a2-9097-e7a86feaa058.png',
                },
              },
            },
          },
          {
            id: 'f9968174-0d17-4e21-9ede-51d210ba556e',
            key: 'option_2_wfe',
            title_multiloc: {
              en: 'Option 2',
              'fr-BE': 'Option 2',
              'nl-BE': 'Option 2',
            },
            other: false,
            image_id: '99a74890-dcc0-4038-811e-40b444799447',
            image: {
              id: '99a74890-dcc0-4038-811e-40b444799447',
              type: 'image',
              attributes: {
                ordering: 0,
                created_at: '2025-12-19T16:48:42.984Z',
                updated_at: '2025-12-19T16:48:55.654Z',
                versions: {
                  small:
                    'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/99a74890-dcc0-4038-811e-40b444799447/small_faf54a9b-8b3a-414b-8e15-689de9e362dc.png',
                  medium:
                    'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/99a74890-dcc0-4038-811e-40b444799447/medium_faf54a9b-8b3a-414b-8e15-689de9e362dc.png',
                  large:
                    'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/99a74890-dcc0-4038-811e-40b444799447/large_faf54a9b-8b3a-414b-8e15-689de9e362dc.png',
                  fb: 'http://localhost:4000/uploads/c72c5211-8e03-470b-9564-04ec0a8c322b/custom_field_option_image/image/99a74890-dcc0-4038-811e-40b444799447/fb_faf54a9b-8b3a-414b-8e15-689de9e362dc.png',
                },
              },
            },
          },
        ],
        matrix_statements: [],
      },
      {
        id: '26a8e287-12a4-4009-823c-3341bbc37af1',
        type: 'custom_field',
        attributes: {
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
          code: null,
          created_at: '2025-12-19T16:48:55.666Z',
          updated_at: '2025-12-19T16:48:55.666Z',
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
          constraints: {},
        },
        relationships: {
          options: {
            data: [],
          },
          resource: {
            data: {
              id: 'e2efbf22-73af-4be8-9816-63f6b2c47026',
              type: 'custom_form',
            },
          },
          map_config: {
            data: null,
          },
        },
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
        code: null,
        created_at: '2025-12-19T16:48:55.666Z',
        updated_at: '2025-12-19T16:48:55.666Z',
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
        constraints: {},
        map_config: {
          data: null,
        },
        options: [],
        matrix_statements: [],
      },
    ];

    expect(constructFlatCustomFields(customFieldsResponse)).toEqual(
      expectedFlatCustomFields
    );
  });
});
