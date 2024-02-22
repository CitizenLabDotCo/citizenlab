import { resetOptionsIfNotPersisted, resetCopiedForm } from './utils';

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

describe('resetCopiedForm', () => {
  const customFields = [
    {
      id: '83d2dd6c-93f8-42c8-a099-870aa0fb205f',
      input_type: 'page',
      logic: {},
      required: false,
      enabled: true,
      title_multiloc: {},
      key: 'page1',
      code: null,
      description_multiloc: {},
    },
    {
      id: '53b0aea7-8f23-472e-a790-08a2e9c375f7',
      input_type: 'select',
      logic: {
        rules: [
          {
            if: '96e275e5b8194c7b85ac615665930d2b',
            goto_page_id: 'f966eb8caeb249a6a00e26cc39bf93ea',
          },
          {
            if: '1f911f35352d4e2082b30b8afb92d084',
            goto_page_id: '48265b4df96148538e31d88641429e97',
          },
          {
            if: 'ce45745e59344bd28cfad3535c3c5518',
            goto_page_id: 'survey_end',
          },
        ],
      },
      required: true,
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
          title_multiloc: { en: 'Option 1' },
          other: false,
        },
        {
          id: '1f911f35352d4e2082b30b8afb92d084',
          title_multiloc: { en: 'Option 2' },
          other: false,
        },
        {
          id: 'ce45745e59344bd28cfad3535c3c5518',
          title_multiloc: { en: 'Option 3' },
        },
      ],
      maximum_select_count: null,
      minimum_select_count: null,
      random_option_ordering: false,
    },
    {
      input_type: 'page',
      id: 'f966eb8caeb249a6a00e26cc39bf93ea',
      logic: { next_page_id: 'f5ac8a59213b4c6d8e3a95a646d587cc' },
      required: false,
      enabled: true,
      title_multiloc: {},
      description_multiloc: {},
    },
    {
      input_type: 'text',
      required: false,
      enabled: true,
      title_multiloc: { en: 'Question 1' },
      description_multiloc: {},
    },
    {
      input_type: 'page',
      id: '48265b4df96148538e31d88641429e97',
      logic: { next_page_id: 'survey_end' },
      required: false,
      enabled: true,
      title_multiloc: {},
      description_multiloc: {},
    },
    {
      input_type: 'text',
      required: false,
      enabled: true,
      title_multiloc: { en: 'Question 2' },
      description_multiloc: {},
    },
    {
      input_type: 'page',
      id: 'f5ac8a59213b4c6d8e3a95a646d587cc',
      logic: {},
      required: false,
      enabled: true,
      title_multiloc: { en: '' },
      description_multiloc: {},
    },
    {
      input_type: 'text',
      required: false,
      enabled: true,
      title_multiloc: { en: 'Question 3' },
      description_multiloc: {},
    },
  ];

  const resultCustomFields = resetCopiedForm(customFields);

  it('should reset all IDs with a numeric ID', () => {
    resultCustomFields.forEach((field) => {
      expect(field.id).toMatch(/^\d+$/);
    });
  });

  it('should add temp_id to all page custom fields', () => {
    resultCustomFields.forEach((field) => {
      if (field.input_type === 'page') {
        expect(field.temp_id).toMatch(/^TEMP-ID-/);
      }
    });
  });

  it('should add remove id and add temp_id to all custom field options', () => {
    resultCustomFields.forEach((field) => {
      if (field.input_type === 'select') {
        field.options.forEach((option) => {
          expect(option.id).toBe(undefined);
          expect(option.temp_id).toMatch(/^TEMP-ID-/);
        });
      }
    });
  });

  it('should replace ids in select logic rules with TEMP-ID unless the page ID is survey end', () => {
    resultCustomFields.forEach((field) => {
      if (field.input_type === 'select') {
        field.logic.rules.forEach((rule) => {
          expect(rule.if).toMatch(/^TEMP-ID-/);
          if (rule.goto_page_id !== 'survey_end') {
            expect(rule.goto_page_id).toMatch(/^TEMP-ID-/);
          }
        });
      }
    });
  });

  it('should replace ids in page logic next_page_id with TEMP-ID unless the page ID is survey end', () => {
    resultCustomFields.forEach((field) => {
      if (field.input_type === 'page') {
        if (
          field.logic.next_page_id &&
          field.logic.next_page_id !== 'survey_end'
        ) {
          expect(field.logic.next_page_id).toMatch(/^TEMP-ID-/);
        }
      }
    });
  });
});
