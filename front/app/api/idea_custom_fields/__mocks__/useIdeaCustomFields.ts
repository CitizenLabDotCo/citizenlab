import { IIdeaCustomFieldData } from '../types';

export const ideaCustomFieldsData: IIdeaCustomFieldData[] = [
  {
    id: 'id',
    type: 'custom_field',
    attributes: {
      key: 'key',
      title_multiloc: { en: 'A mock title 1' },
      description_multiloc: { en: 'A mock description 1' },
      input_type: 'select',
      required: false,
      code: null,
      enabled: true,
      hidden: false,
      ordering: 1,
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z',
    },
  },
  {
    id: 'id',
    type: 'custom_field',
    attributes: {
      key: 'key2',
      title_multiloc: { en: 'A mock title 2' },
      description_multiloc: { en: 'A mock description 2' },
      input_type: 'select',
      required: false,
      code: null,
      enabled: true,
      hidden: false,
      ordering: 2,
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z',
    },
  },
];

export default jest.fn(() => {
  return { data: { data: ideaCustomFieldsData } };
});
