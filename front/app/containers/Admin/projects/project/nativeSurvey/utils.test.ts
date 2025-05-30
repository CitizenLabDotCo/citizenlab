import { IFlatCustomField } from 'api/custom_fields/types';

import { clearOptionAndStatementIds } from './utils';

describe('clearOptionIds', () => {
  const customFields: IFlatCustomField[] = [
    {
      id: '53b0aea7-8f23-472e-a790-08a2e9c375f7',
      type: 'custom_field',
      input_type: 'select',
      logic: {},
      required: false,
      enabled: true,
      title_multiloc: {
        en: 'Your question',
      },
      key: 'your_question_6nx',
      description_multiloc: {},
      options: [
        {
          id: '96e275e5b8194c7b85ac615665930d2b',
          title_multiloc: {
            en: 'Option 1',
          },
          other: false,
        },
        {
          id: '1f911f35352d4e2082b30b8afb92d084',
          title_multiloc: {
            en: 'Option 2',
          },
          other: false,
        },
      ],
      random_option_ordering: false,
      linear_scale_label_1_multiloc: {},
      linear_scale_label_2_multiloc: {},
      linear_scale_label_3_multiloc: {},
      linear_scale_label_4_multiloc: {},
      linear_scale_label_5_multiloc: {},
      linear_scale_label_6_multiloc: {},
      linear_scale_label_7_multiloc: {},
      linear_scale_label_8_multiloc: {},
      linear_scale_label_9_multiloc: {},
      linear_scale_label_10_multiloc: {},
      linear_scale_label_11_multiloc: {},
      matrix_statements: [
        {
          id: '96e275e5b8194c7b85ac615665930d22',
          key: 'key1',
          title_multiloc: {
            en: 'Statement 1',
          },
        },
        {
          id: '1f911f35352d4e2082b30b8afb92d081',
          key: 'key2',
          title_multiloc: {
            en: 'Statement 2',
          },
        },
      ],
      ordering: 1,
      updated_at: '2024-01-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
    },
  ];

  it('should remove the ID from field options and statements', () => {
    const resultCustomFields = clearOptionAndStatementIds(customFields);
    expect(resultCustomFields[0]?.options?.[0].id).toBe(undefined);
    expect(resultCustomFields[0]?.options?.[1].id).toBe(undefined);
    expect(resultCustomFields[0]?.matrix_statements?.[0].id).toBe(undefined);
    expect(resultCustomFields[0]?.matrix_statements?.[1].id).toBe(undefined);
  });
});
