import { IFlatCustomField } from 'api/custom_fields/types';

import { clearOptionIds } from './utils';

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
      minimum_label_multiloc: {},
      maximum_label_multiloc: {},
      ordering: 1,
      updated_at: '2024-01-01T00:00:00.000Z',
      created_at: '2024-01-01T00:00:00.000Z',
    },
  ];

  it('should remove the ID from field options', () => {
    const resultCustomFields = clearOptionIds(customFields);
    expect(resultCustomFields[0]?.options?.[0].id).toBe(undefined);
    expect(resultCustomFields[0]?.options?.[1].id).toBe(undefined);
  });
});
