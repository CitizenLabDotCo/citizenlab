import { ICustomFieldOptionData } from '../types';

export const customFieldOptionsData: ICustomFieldOptionData[] = [
  {
    id: 'id',
    type: 'custom_field_option',
    attributes: {
      key: 'key',
      title_multiloc: { en: 'A mock option 1' },
      ordering: 1,
      other: false,
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z',
    },
    relationships: {
      image: {},
    },
  },
  {
    id: 'id',
    type: 'custom_field_option',
    attributes: {
      key: 'key2',
      title_multiloc: { en: 'A mock option2' },
      ordering: 2,
      other: false,
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z',
    },
    relationships: {
      image: {},
    },
  },
];

export default jest.fn(() => {
  return { data: { data: customFieldOptionsData } };
});
