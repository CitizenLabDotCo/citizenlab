import { array, object, string } from 'yup';

import validateLogic from './validateLogic';

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
