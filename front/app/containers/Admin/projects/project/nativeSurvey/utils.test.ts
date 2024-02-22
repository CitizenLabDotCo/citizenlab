import { resetOptionsIfNotPersisted } from './utils';

describe('resetOptionsIfNotPersisted', () => {
  const customFields = [
    {
      id: '53b0aea7-8f23-472e-a790-08a2e9c375f7',
      input_type: 'select',
      logic: {},
      required: false,
      enabled: true,
      title_multiloc: {
        en: 'Your question',
      },
      key: 'your_question_6nx',
      code: null,
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
      maximum_select_count: null,
      minimum_select_count: null,
      random_option_ordering: false,
    },
  ];

  it('should not alter the fields if the form is already persisted', () => {
    const resultCustomFields = resetOptionsIfNotPersisted(customFields, true);
    expect(resultCustomFields).toEqual(customFields);
  });

  it('should remove the ID from options and add a tempID', () => {
    const resultCustomFields = resetOptionsIfNotPersisted(customFields, false);
    expect(resultCustomFields[0].options[0].id).toBe(undefined);
    expect(resultCustomFields[0].options[1].id).toBe(undefined);
    expect(resultCustomFields[0].options[0].temp_id).toMatch(/^TEMP-ID-/);
    expect(resultCustomFields[0].options[1].temp_id).toMatch(/^TEMP-ID-/);
  });
});
