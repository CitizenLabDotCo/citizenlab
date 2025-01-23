import { getReorderedFields } from './utils';

describe('getReorderedFields', () => {
  describe('idea form', () => {
    it('correctly reorders section', () => {
      const nestedGroupData = [
        {
          groupElement: {
            id: '7d3f530e-d365-4a50-b713-3346f9ac9201',
            type: 'custom_field',
            attributes: {
              key: null,
              input_type: 'section',
              title_multiloc: {
                en: 'What is your idea?',
                'nl-BE': 'Wat is je idee?',
                'fr-BE': 'Quelle est votre idée ?',
              },
              required: false,
              ordering: 0,
              enabled: true,
              code: 'ideation_section1',
              created_at: null,
              updated_at: null,
              logic: {},
              random_option_ordering: false,
              description_multiloc: {},
              answer_visible_to: 'public',
              constraints: {
                locks: {
                  enabled: true,
                  title_multiloc: true,
                },
              },
            },
            relationships: {
              options: {
                data: [],
              },
              resource: {
                data: null,
              },
            },
            key: null,
            input_type: 'section',
            title_multiloc: {
              en: 'What is your idea?',
              'nl-BE': 'Wat is je idee?',
              'fr-BE': 'Quelle est votre idée ?',
            },
            required: false,
            ordering: 0,
            enabled: true,
            code: 'ideation_section1',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {
              locks: {
                enabled: true,
                title_multiloc: true,
              },
            },
            options: [],
          },
          questions: [
            {
              id: 'ec91435a-6da5-47cc-a2b4-5c0cce56872d',
              type: 'custom_field',
              attributes: {
                key: 'title_multiloc',
                input_type: 'text_multiloc',
                title_multiloc: {
                  en: 'Title',
                },
                required: true,
                ordering: 1,
                enabled: true,
                code: 'title_multiloc',
                created_at: null,
                updated_at: null,
                logic: {},
                random_option_ordering: false,
                description_multiloc: {},
                answer_visible_to: 'public',
                constraints: {
                  locks: {
                    enabled: true,
                    required: true,
                    title_multiloc: true,
                  },
                },
              },
              relationships: {
                options: {
                  data: [],
                },
                resource: {
                  data: null,
                },
              },
              key: 'title_multiloc',
              input_type: 'text_multiloc',
              title_multiloc: {
                en: 'Title',
              },
              required: true,
              ordering: 1,
              enabled: true,
              code: 'title_multiloc',
              created_at: null,
              updated_at: null,
              logic: {},
              random_option_ordering: false,
              description_multiloc: {},
              answer_visible_to: 'public',
              constraints: {
                locks: {
                  enabled: true,
                  required: true,
                  title_multiloc: true,
                },
              },
              options: [],
            },
            {
              id: '492663bc-fc6a-4fd2-a29a-4a3482b47818',
              type: 'custom_field',
              attributes: {
                key: 'body_multiloc',
                input_type: 'html_multiloc',
                title_multiloc: {
                  en: 'Description',
                },
                required: true,
                ordering: 2,
                enabled: true,
                code: 'body_multiloc',
                created_at: null,
                updated_at: null,
                logic: {},
                random_option_ordering: false,
                description_multiloc: {},
                answer_visible_to: 'public',
                constraints: {
                  locks: {
                    enabled: true,
                    required: true,
                    title_multiloc: true,
                  },
                },
              },
              relationships: {
                options: {
                  data: [],
                },
                resource: {
                  data: null,
                },
              },
              key: 'body_multiloc',
              input_type: 'html_multiloc',
              title_multiloc: {
                en: 'Description',
              },
              required: true,
              ordering: 2,
              enabled: true,
              code: 'body_multiloc',
              created_at: null,
              updated_at: null,
              logic: {},
              random_option_ordering: false,
              description_multiloc: {},
              answer_visible_to: 'public',
              constraints: {
                locks: {
                  enabled: true,
                  required: true,
                  title_multiloc: true,
                },
              },
              options: [],
            },
          ],
          id: '7d3f530e-d365-4a50-b713-3346f9ac9201',
        },
        {
          groupElement: {
            id: '68bcb486-836f-4ed0-a6ac-dc929cfb6ac6',
            type: 'custom_field',
            attributes: {
              key: null,
              input_type: 'section',
              title_multiloc: {
                en: 'Images and attachments',
              },
              required: false,
              ordering: 3,
              enabled: true,
              code: 'ideation_section2',
              created_at: null,
              updated_at: null,
              logic: {},
              random_option_ordering: false,
              description_multiloc: {},
              answer_visible_to: 'public',
              constraints: {},
            },
            relationships: {
              options: {
                data: [],
              },
              resource: {
                data: null,
              },
            },
            key: null,
            input_type: 'section',
            title_multiloc: {
              en: 'Images and attachments',
            },
            required: false,
            ordering: 3,
            enabled: true,
            code: 'ideation_section2',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {},
            options: [],
          },
          questions: [
            {
              id: 'ac4ccb64-f5df-40b1-9dae-fcd5eb463b9f',
              type: 'custom_field',
              attributes: {
                key: 'idea_images_attributes',
                input_type: 'image_files',
                title_multiloc: {
                  en: 'Images',
                },
                required: false,
                ordering: 4,
                enabled: true,
                code: 'idea_images_attributes',
                created_at: null,
                updated_at: null,
                logic: {},
                random_option_ordering: false,
                description_multiloc: {},
                answer_visible_to: 'public',
                constraints: {
                  locks: {
                    enabled: true,
                    title_multiloc: true,
                  },
                },
              },
              relationships: {
                options: {
                  data: [],
                },
                resource: {
                  data: null,
                },
              },
              key: 'idea_images_attributes',
              input_type: 'image_files',
              title_multiloc: {
                en: 'Images',
              },
              required: false,
              ordering: 4,
              enabled: true,
              code: 'idea_images_attributes',
              created_at: null,
              updated_at: null,
              logic: {},
              random_option_ordering: false,
              description_multiloc: {},
              answer_visible_to: 'public',
              constraints: {
                locks: {
                  enabled: true,
                  title_multiloc: true,
                },
              },
              options: [],
            },
            {
              id: 'fac04300-1574-44b0-9ba2-2361195beab0',
              type: 'custom_field',
              attributes: {
                key: 'idea_files_attributes',
                input_type: 'files',
                title_multiloc: {
                  en: 'Attachments',
                },
                required: false,
                ordering: 5,
                enabled: true,
                code: 'idea_files_attributes',
                created_at: null,
                updated_at: null,
                logic: {},
                random_option_ordering: false,
                description_multiloc: {},
                answer_visible_to: 'public',
                constraints: {
                  locks: {
                    title_multiloc: true,
                  },
                },
              },
              relationships: {
                options: {
                  data: [],
                },
                resource: {
                  data: null,
                },
              },
              key: 'idea_files_attributes',
              input_type: 'files',
              title_multiloc: {
                en: 'Attachments',
              },
              required: false,
              ordering: 5,
              enabled: true,
              code: 'idea_files_attributes',
              created_at: null,
              updated_at: null,
              logic: {},
              random_option_ordering: false,
              description_multiloc: {},
              answer_visible_to: 'public',
              constraints: {
                locks: {
                  title_multiloc: true,
                },
              },
              options: [],
            },
          ],
          id: '68bcb486-836f-4ed0-a6ac-dc929cfb6ac6',
        },
        {
          groupElement: {
            id: '1a680ef9-7fb5-4ca8-9a79-50f776b6ccbc',
            type: 'custom_field',
            attributes: {
              key: null,
              input_type: 'section',
              title_multiloc: {
                en: 'Details',
              },
              required: false,
              ordering: 6,
              enabled: true,
              code: 'ideation_section3',
              created_at: null,
              updated_at: null,
              logic: {},
              random_option_ordering: false,
              description_multiloc: {},
              answer_visible_to: 'public',
              constraints: {},
            },
            relationships: {
              options: {
                data: [],
              },
              resource: {
                data: null,
              },
            },
            key: null,
            input_type: 'section',
            title_multiloc: {
              en: 'Details',
            },
            required: false,
            ordering: 6,
            enabled: true,
            code: 'ideation_section3',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {},
            options: [],
          },
          questions: [
            {
              id: 'c877d916-5b02-4333-bd8f-80007bf38b15',
              type: 'custom_field',
              attributes: {
                key: 'topic_ids',
                input_type: 'topic_ids',
                title_multiloc: {
                  en: 'Tags',
                },
                required: false,
                ordering: 7,
                enabled: true,
                code: 'topic_ids',
                created_at: null,
                updated_at: null,
                logic: {},
                random_option_ordering: false,
                description_multiloc: {},
                answer_visible_to: 'public',
                constraints: {
                  locks: {
                    title_multiloc: true,
                  },
                },
              },
              relationships: {
                options: {
                  data: [],
                },
                resource: {
                  data: null,
                },
              },
              key: 'topic_ids',
              input_type: 'topic_ids',
              title_multiloc: {
                en: 'Tags',
              },
              required: false,
              ordering: 7,
              enabled: true,
              code: 'topic_ids',
              created_at: null,
              updated_at: null,
              logic: {},
              random_option_ordering: false,
              description_multiloc: {},
              answer_visible_to: 'public',
              constraints: {
                locks: {
                  title_multiloc: true,
                },
              },
              options: [],
            },
            {
              id: '32b94f84-2f9e-4036-86d6-f23c3529b282',
              type: 'custom_field',
              attributes: {
                key: 'location_description',
                input_type: 'text',
                title_multiloc: {
                  en: 'Location',
                },
                required: false,
                ordering: 8,
                enabled: true,
                code: 'location_description',
                created_at: null,
                updated_at: null,
                logic: {},
                random_option_ordering: false,
                description_multiloc: {},
                answer_visible_to: 'public',
                constraints: {
                  locks: {
                    title_multiloc: true,
                  },
                },
              },
              relationships: {
                options: {
                  data: [],
                },
                resource: {
                  data: null,
                },
              },
              key: 'location_description',
              input_type: 'text',
              title_multiloc: {
                en: 'Location',
              },
              required: false,
              ordering: 8,
              enabled: true,
              code: 'location_description',
              created_at: null,
              updated_at: null,
              logic: {},
              random_option_ordering: false,
              description_multiloc: {},
              answer_visible_to: 'public',
              constraints: {
                locks: {
                  title_multiloc: true,
                },
              },
              options: [],
            },
            {
              id: '1f194455-60cd-4b7a-a706-29d7ac376c6d',
              type: 'custom_field',
              attributes: {
                key: 'proposed_budget',
                input_type: 'number',
                title_multiloc: {
                  en: 'Proposed Budget',
                },
                required: false,
                ordering: 9,
                enabled: false,
                code: 'proposed_budget',
                created_at: null,
                updated_at: null,
                logic: {},
                random_option_ordering: false,
                description_multiloc: {},
                answer_visible_to: 'public',
                constraints: {
                  locks: {
                    title_multiloc: true,
                  },
                },
              },
              relationships: {
                options: {
                  data: [],
                },
                resource: {
                  data: null,
                },
              },
              key: 'proposed_budget',
              input_type: 'number',
              title_multiloc: {
                en: 'Proposed Budget',
              },
              required: false,
              ordering: 9,
              enabled: false,
              code: 'proposed_budget',
              created_at: null,
              updated_at: null,
              logic: {},
              random_option_ordering: false,
              description_multiloc: {},
              answer_visible_to: 'public',
              constraints: {
                locks: {
                  title_multiloc: true,
                },
              },
              options: [],
            },
          ],
          id: '1a680ef9-7fb5-4ca8-9a79-50f776b6ccbc',
        },
      ];

      const result = {
        draggableId: '1a680ef9-7fb5-4ca8-9a79-50f776b6ccbc',
        type: 'droppable-page',
        source: {
          index: 2,
          droppableId: 'droppable',
        },
        reason: 'DROP',
        mode: 'FLUID',
        destination: {
          droppableId: 'droppable',
          index: 1,
        },
        combine: null,
      };

      const output = [
        {
          id: '7d3f530e-d365-4a50-b713-3346f9ac9201',
          type: 'custom_field',
          attributes: {
            key: null,
            input_type: 'section',
            title_multiloc: {
              en: 'What is your idea?',
            },
            required: false,
            ordering: 0,
            enabled: true,
            code: 'ideation_section1',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {
              locks: {
                enabled: true,
                title_multiloc: true,
              },
            },
          },
          relationships: {
            options: {
              data: [],
            },
            resource: {
              data: null,
            },
          },
          key: null,
          input_type: 'section',
          title_multiloc: {
            en: 'What is your idea?',
          },
          required: false,
          ordering: 0,
          enabled: true,
          code: 'ideation_section1',
          created_at: null,
          updated_at: null,
          logic: {},
          random_option_ordering: false,
          description_multiloc: {},
          answer_visible_to: 'public',
          constraints: {
            locks: {
              enabled: true,
              title_multiloc: true,
            },
          },
          options: [],
        },
        {
          id: 'ec91435a-6da5-47cc-a2b4-5c0cce56872d',
          type: 'custom_field',
          attributes: {
            key: 'title_multiloc',
            input_type: 'text_multiloc',
            title_multiloc: {
              en: 'Title',
            },
            required: true,
            ordering: 1,
            enabled: true,
            code: 'title_multiloc',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {
              locks: {
                enabled: true,
                required: true,
                title_multiloc: true,
              },
            },
          },
          relationships: {
            options: {
              data: [],
            },
            resource: {
              data: null,
            },
          },
          key: 'title_multiloc',
          input_type: 'text_multiloc',
          title_multiloc: {
            en: 'Title',
          },
          required: true,
          ordering: 1,
          enabled: true,
          code: 'title_multiloc',
          created_at: null,
          updated_at: null,
          logic: {},
          random_option_ordering: false,
          description_multiloc: {},
          answer_visible_to: 'public',
          constraints: {
            locks: {
              enabled: true,
              required: true,
              title_multiloc: true,
            },
          },
          options: [],
        },
        {
          id: '492663bc-fc6a-4fd2-a29a-4a3482b47818',
          type: 'custom_field',
          attributes: {
            key: 'body_multiloc',
            input_type: 'html_multiloc',
            title_multiloc: {
              en: 'Description',
            },
            required: true,
            ordering: 2,
            enabled: true,
            code: 'body_multiloc',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {
              locks: {
                enabled: true,
                required: true,
                title_multiloc: true,
              },
            },
          },
          relationships: {
            options: {
              data: [],
            },
            resource: {
              data: null,
            },
          },
          key: 'body_multiloc',
          input_type: 'html_multiloc',
          title_multiloc: {
            en: 'Description',
          },
          required: true,
          ordering: 2,
          enabled: true,
          code: 'body_multiloc',
          created_at: null,
          updated_at: null,
          logic: {},
          random_option_ordering: false,
          description_multiloc: {},
          answer_visible_to: 'public',
          constraints: {
            locks: {
              enabled: true,
              required: true,
              title_multiloc: true,
            },
          },
          options: [],
        },
        {
          id: '1a680ef9-7fb5-4ca8-9a79-50f776b6ccbc',
          type: 'custom_field',
          attributes: {
            key: null,
            input_type: 'section',
            title_multiloc: {
              en: 'Details',
            },
            required: false,
            ordering: 6,
            enabled: true,
            code: 'ideation_section3',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {},
          },
          relationships: {
            options: {
              data: [],
            },
            resource: {
              data: null,
            },
          },
          key: null,
          input_type: 'section',
          title_multiloc: {
            en: 'Details',
          },
          required: false,
          ordering: 6,
          enabled: true,
          code: 'ideation_section3',
          created_at: null,
          updated_at: null,
          logic: {},
          random_option_ordering: false,
          description_multiloc: {},
          answer_visible_to: 'public',
          constraints: {},
          options: [],
        },
        {
          id: 'c877d916-5b02-4333-bd8f-80007bf38b15',
          type: 'custom_field',
          attributes: {
            key: 'topic_ids',
            input_type: 'topic_ids',
            title_multiloc: {
              en: 'Tags',
            },
            required: false,
            ordering: 7,
            enabled: true,
            code: 'topic_ids',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {
              locks: {
                title_multiloc: true,
              },
            },
          },
          relationships: {
            options: {
              data: [],
            },
            resource: {
              data: null,
            },
          },
          key: 'topic_ids',
          input_type: 'topic_ids',
          title_multiloc: {
            en: 'Tags',
          },
          required: false,
          ordering: 7,
          enabled: true,
          code: 'topic_ids',
          created_at: null,
          updated_at: null,
          logic: {},
          random_option_ordering: false,
          description_multiloc: {},
          answer_visible_to: 'public',
          constraints: {
            locks: {
              title_multiloc: true,
            },
          },
          options: [],
        },
        {
          id: '32b94f84-2f9e-4036-86d6-f23c3529b282',
          type: 'custom_field',
          attributes: {
            key: 'location_description',
            input_type: 'text',
            title_multiloc: {
              en: 'Location',
            },
            required: false,
            ordering: 8,
            enabled: true,
            code: 'location_description',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {
              locks: {
                title_multiloc: true,
              },
            },
          },
          relationships: {
            options: {
              data: [],
            },
            resource: {
              data: null,
            },
          },
          key: 'location_description',
          input_type: 'text',
          title_multiloc: {
            en: 'Location',
          },
          required: false,
          ordering: 8,
          enabled: true,
          code: 'location_description',
          created_at: null,
          updated_at: null,
          logic: {},
          random_option_ordering: false,
          description_multiloc: {},
          answer_visible_to: 'public',
          constraints: {
            locks: {
              title_multiloc: true,
            },
          },
          options: [],
        },
        {
          id: '1f194455-60cd-4b7a-a706-29d7ac376c6d',
          type: 'custom_field',
          attributes: {
            key: 'proposed_budget',
            input_type: 'number',
            title_multiloc: {
              en: 'Proposed Budget',
            },
            required: false,
            ordering: 9,
            enabled: false,
            code: 'proposed_budget',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {
              locks: {
                title_multiloc: true,
              },
            },
          },
          relationships: {
            options: {
              data: [],
            },
            resource: {
              data: null,
            },
          },
          key: 'proposed_budget',
          input_type: 'number',
          title_multiloc: {
            en: 'Proposed Budget',
          },
          required: false,
          ordering: 9,
          enabled: false,
          code: 'proposed_budget',
          created_at: null,
          updated_at: null,
          logic: {},
          random_option_ordering: false,
          description_multiloc: {},
          answer_visible_to: 'public',
          constraints: {
            locks: {
              title_multiloc: true,
            },
          },
          options: [],
        },
        {
          id: '68bcb486-836f-4ed0-a6ac-dc929cfb6ac6',
          type: 'custom_field',
          attributes: {
            key: null,
            input_type: 'section',
            title_multiloc: {
              en: 'Images and attachments',
            },
            required: false,
            ordering: 3,
            enabled: true,
            code: 'ideation_section2',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {},
          },
          relationships: {
            options: {
              data: [],
            },
            resource: {
              data: null,
            },
          },
          key: null,
          input_type: 'section',
          title_multiloc: {
            en: 'Images and attachments',
          },
          required: false,
          ordering: 3,
          enabled: true,
          code: 'ideation_section2',
          created_at: null,
          updated_at: null,
          logic: {},
          random_option_ordering: false,
          description_multiloc: {},
          answer_visible_to: 'public',
          constraints: {},
          options: [],
        },
        {
          id: 'ac4ccb64-f5df-40b1-9dae-fcd5eb463b9f',
          type: 'custom_field',
          attributes: {
            key: 'idea_images_attributes',
            input_type: 'image_files',
            title_multiloc: {
              en: 'Images',
            },
            required: false,
            ordering: 4,
            enabled: true,
            code: 'idea_images_attributes',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {
              locks: {
                enabled: true,
                title_multiloc: true,
              },
            },
          },
          relationships: {
            options: {
              data: [],
            },
            resource: {
              data: null,
            },
          },
          key: 'idea_images_attributes',
          input_type: 'image_files',
          title_multiloc: {
            en: 'Images',
          },
          required: false,
          ordering: 4,
          enabled: true,
          code: 'idea_images_attributes',
          created_at: null,
          updated_at: null,
          logic: {},
          random_option_ordering: false,
          description_multiloc: {},
          answer_visible_to: 'public',
          constraints: {
            locks: {
              enabled: true,
              title_multiloc: true,
            },
          },
          options: [],
        },
        {
          id: 'fac04300-1574-44b0-9ba2-2361195beab0',
          type: 'custom_field',
          attributes: {
            key: 'idea_files_attributes',
            input_type: 'files',
            title_multiloc: {
              en: 'Attachments',
            },
            required: false,
            ordering: 5,
            enabled: true,
            code: 'idea_files_attributes',
            created_at: null,
            updated_at: null,
            logic: {},
            random_option_ordering: false,
            description_multiloc: {},
            answer_visible_to: 'public',
            constraints: {
              locks: {
                title_multiloc: true,
              },
            },
          },
          relationships: {
            options: {
              data: [],
            },
            resource: {
              data: null,
            },
          },
          key: 'idea_files_attributes',
          input_type: 'files',
          title_multiloc: {
            en: 'Attachments',
          },
          required: false,
          ordering: 5,
          enabled: true,
          code: 'idea_files_attributes',
          created_at: null,
          updated_at: null,
          logic: {},
          random_option_ordering: false,
          description_multiloc: {},
          answer_visible_to: 'public',
          constraints: {
            locks: {
              title_multiloc: true,
            },
          },
          options: [],
        },
      ];

      expect(getReorderedFields(result, nestedGroupData as any)).toEqual(
        output
      );
    });
  });
});
