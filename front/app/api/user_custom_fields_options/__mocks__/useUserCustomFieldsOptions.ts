import { IUserCustomFieldOptionData } from '../types';

export const userCustomFieldsOptionsData: IUserCustomFieldOptionData[] = [
  {
    id: 'id',
    type: 'custom_field_option',
    attributes: {
      key: 'key',
      title_multiloc: { en: 'A mock option 1' },
      ordering: 1,
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z',
    },
  },
  {
    id: 'id',
    type: 'custom_field_option',
    attributes: {
      key: 'key2',
      title_multiloc: { en: 'A mock option2' },
      ordering: 2,
      created_at: '2020-01-01T00:00:00.000Z',
      updated_at: '2020-01-01T00:00:00.000Z',
    },
  },
];

export default jest.fn(() => {
  return { data: { data: userCustomFieldsOptionsData } };
});
