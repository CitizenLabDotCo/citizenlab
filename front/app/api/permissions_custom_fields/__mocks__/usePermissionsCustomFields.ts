import { IPermissionsCustomFieldData } from '../types';

export const permissionsCustomFieldsData: IPermissionsCustomFieldData[] = [
  {
    custom_field_id: 'customFieldId1',
    required: false,
    type: '',
  },
  {
    custom_field_id: 'customFieldId2',
    required: false,
    type: '',
  },
];

export default jest.fn(() => {
  return { data: { data: permissionsCustomFieldsData } };
});
