import { array, object, string } from 'yup';

import { IFlatCustomField, LogicType } from 'api/custom_fields/types';

import validateLogic, { isPageRuleValid, isRuleValid } from './validateLogic';

const validSchema = {
  data: [
    {
      id: '51356b06-f62b-4e65-a138-d0618e55e712',
      type: 'custom_field',
      key: '__4',
    },
    {
      id: 'fb6d56ff-d59d-4a89-8dff-0c904caece29',
      type: 'custom_field',
      key: 'title',
      input_type: 'select',
      logic: {
        rules: [
          {
            if: '34f0d355-34b9-4653-a43e-49b86a752b63',
            goto_page_id: '6b4cde0a-0715-40dc-904d-74cb7f65d7ba',
          },
        ],
      },
      options: [
        {
          id: '34f0d355-34b9-4653-a43e-49b86a752b63',
          title_multiloc: {
            en: 'Option 1',
          },
        },
        {
          id: 'd4083fa0-807f-4c4a-85b0-20aeb3ca741d',
          title_multiloc: {
            en: 'Option 2',
          },
        },
      ],
    },
    {
      id: '6b4cde0a-0715-40dc-904d-74cb7f65d7ba',
      type: 'custom_field',
      key: 'page_1',
      input_type: 'page',
    },
  ],
};

const invalidSchema = {
  customFields: [
    {
      id: '51356b06-f62b-4e65-a138-d0618e55e712',
      type: 'custom_field',
      key: '__4',
      input_type: 'page',
    },
    {
      id: 'fb6d56ff-d59d-4a89-8dff-0c904caece29',
      type: 'custom_field',
      key: 'title',
      input_type: 'select',
      logic: {
        rules: [
          {
            if: '34f0d355-34b9-4653-a43e-49b86a752b63',
            goto_page_id: '51356b06-f62b-4e65-a138-d0618e55e712',
          },
        ],
      },
      options: [
        {
          id: '34f0d355-34b9-4653-a43e-49b86a752b63',
          title_multiloc: {
            en: 'Option 1',
          },
        },
        {
          id: 'd4083fa0-807f-4c4a-85b0-20aeb3ca741d',
          title_multiloc: {
            en: 'Option 2',
          },
        },
      ],
    },
    {
      id: '6b4cde0a-0715-40dc-904d-74cb7f65d7ba',
      type: 'custom_field',
      key: 'page_1',
      input_type: 'page',
    },
  ],
};

describe('validateLogic', () => {
  const schema = object().shape({
    customFields: array().of(
      object().shape({
        input_type: string(),
        logic: validateLogic('Logic is invalid'),
      })
    ),
  });

  it('should be valid if logic only references future pages', async () => {
    const result = await schema.isValid(validSchema);
    expect(result).toBe(true);
  });

  it('should be invalid if logic references a past page', async () => {
    const result = await schema.isValid(invalidSchema);
    expect(result).toBe(false);

    const error = await schema.validate(invalidSchema).catch((err) => err);
    expect(error.message).toBe('Logic is invalid');
  });
});

describe('validateLogic rules', () => {
  const schema = object().shape({
    customFields: array().of(
      object().shape({
        input_type: string(),
        logic: validateLogic('Logic is invalid'),
      })
    ),
  });

  type TestField = {
    id: string;
    temp_id?: string;
    input_type: string;
    logic: LogicType;
  };

  const page = (id: string, logic: LogicType = {}): TestField => ({
    id,
    input_type: 'page',
    logic,
  });

  // A question on the second page, between page-2 and page-3.
  const formWithQuestion = (question: TestField): TestField[] => [
    page('page-1'),
    page('page-2'),
    question,
    page('page-3'),
    page('page-end'),
  ];

  const isValid = (customFields: TestField[]) =>
    schema.isValid({ customFields });

  it.each([
    { inputType: 'select', label: '' },
    { inputType: 'multiselect', label: '' },
    { inputType: 'multiselect_image', label: '' },
    { inputType: 'rating', label: ' (current behaviour, B1)' },
  ])(
    'rejects a $inputType rule that targets an earlier page$label',
    async ({ inputType }) => {
      const question = {
        id: 'q',
        input_type: inputType,
        logic: { rules: [{ if: 'option-id', goto_page_id: 'page-1' }] },
      };

      expect(await isValid(formWithQuestion(question))).toBe(false);
    }
  );

  it('rejects a linear scale rule that targets an earlier page', async () => {
    const question = {
      id: 'q',
      input_type: 'linear_scale',
      logic: { rules: [{ if: 3, goto_page_id: 'page-1' }] },
    };

    expect(await isValid(formWithQuestion(question))).toBe(false);
  });

  it('rejects a rule that targets the page the question is on', async () => {
    const question = {
      id: 'q',
      input_type: 'select',
      logic: { rules: [{ if: 'option-id', goto_page_id: 'page-2' }] },
    };

    expect(await isValid(formWithQuestion(question))).toBe(false);
  });

  it('rejects a rule that targets a page that is not in the form', async () => {
    const question = {
      id: 'q',
      input_type: 'select',
      logic: { rules: [{ if: 'option-id', goto_page_id: 'deleted-page' }] },
    };

    expect(await isValid(formWithQuestion(question))).toBe(false);
  });

  it.each(['page-3', 'page-end'])(
    'accepts a rule that targets the later page %s',
    async (target) => {
      const question = {
        id: 'q',
        input_type: 'select',
        logic: {
          rules: [
            { if: 'option-id', goto_page_id: target },
            { if: 'any_other_answer', goto_page_id: target },
            { if: 'no_answer', goto_page_id: target },
          ],
        },
      };

      expect(await isValid(formWithQuestion(question))).toBe(true);
    }
  );

  it('rejects the form when only one of several rules targets an earlier page', async () => {
    const question = {
      id: 'q',
      input_type: 'select',
      logic: {
        rules: [
          { if: 'option-id', goto_page_id: 'page-3' },
          { if: 'no_answer', goto_page_id: 'page-1' },
        ],
      },
    };

    expect(await isValid(formWithQuestion(question))).toBe(false);
  });

  it.each(['ranking', 'text', 'number', 'sentiment_linear_scale'])(
    'does not check the rules of a %s question',
    async (inputType) => {
      const question = {
        id: 'q',
        input_type: inputType,
        logic: { rules: [{ if: 'option-id', goto_page_id: 'page-1' }] },
      };

      expect(await isValid(formWithQuestion(question))).toBe(true);
    }
  );

  it('matches the source question and target page by temporary id', async () => {
    const fields = (target: string): TestField[] => [
      page('page-1'),
      { id: '1', temp_id: 'TEMP-page-2', input_type: 'page', logic: {} },
      {
        id: '2',
        temp_id: 'TEMP-q',
        input_type: 'select',
        logic: { rules: [{ if: 'TEMP-option', goto_page_id: target }] },
      },
      { id: '3', temp_id: 'TEMP-page-3', input_type: 'page', logic: {} },
      page('page-end'),
    ];

    expect(await isValid(fields('TEMP-page-3'))).toBe(true);
    expect(await isValid(fields('TEMP-page-2'))).toBe(false);
  });

  it('validates the default next page of a page', async () => {
    const fields = (nextPageId: string): TestField[] => [
      page('page-1'),
      page('page-2', { next_page_id: nextPageId }),
      page('page-3'),
      page('page-end'),
    ];

    expect(await isValid(fields('page-3'))).toBe(true);
    expect(await isValid(fields('page-end'))).toBe(true);
    expect(await isValid(fields('page-1'))).toBe(false);
    expect(await isValid(fields('page-2'))).toBe(false);
    expect(await isValid(fields('deleted-page'))).toBe(false);
  });

  it('accepts a page without a default next page', async () => {
    expect(await isValid([page('page-1'), page('page-end')])).toBe(true);
  });
});

describe('isRuleValid and isPageRuleValid', () => {
  const field = (
    id: string,
    input_type: IFlatCustomField['input_type'],
    temp_id?: string
  ): IFlatCustomField => ({
    id,
    temp_id,
    type: 'custom_field',
    key: id,
    input_type,
    title_multiloc: {},
    description_multiloc: {},
    required: false,
    answers_visible_to: 'moderators',
    show_as_filter: false,
    enabled: true,
    ordering: 0,
    created_at: '',
    updated_at: '',
    logic: {},
  });

  const fields = [
    field('page-1', 'page'),
    field('q', 'select'),
    field('page-2', 'page', 'TEMP-page-2'),
  ];

  it('accepts a missing rule', () => {
    expect(isRuleValid(undefined, 'q', fields)).toBe(true);
  });

  it('accepts only targets after the source question', () => {
    expect(isRuleValid({ if: 'x', goto_page_id: 'page-2' }, 'q', fields)).toBe(
      true
    );
    expect(
      isRuleValid({ if: 'x', goto_page_id: 'TEMP-page-2' }, 'q', fields)
    ).toBe(true);
    expect(isRuleValid({ if: 'x', goto_page_id: 'page-1' }, 'q', fields)).toBe(
      false
    );
  });

  it('accepts any target when the source question is not in the fields', () => {
    expect(
      isRuleValid({ if: 'x', goto_page_id: 'page-1' }, 'unknown', fields)
    ).toBe(true);
  });

  it('accepts a page without a next page and checks the order otherwise', () => {
    expect(isPageRuleValid(fields, 'page-1')).toBe(true);
    expect(isPageRuleValid(fields, 'page-1', 'page-2')).toBe(true);
    expect(isPageRuleValid(fields, 'page-2', 'page-1')).toBe(false);
    expect(isPageRuleValid(fields, 'page-1', 'deleted-page')).toBe(false);
  });
});
