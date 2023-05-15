import { IPermissionsCustomFieldData } from '../types';

export const permissionsCustomFieldsData: IPermissionsCustomFieldData[] = [
  {
    id: 'customFieldId1',
    type: 'permissions_custom_field',
    attributes: {
      required: false,
      created_at: 'created-at',
      updated_at: 'updated-at',
    },
    relationships: {
      permission: {
        data: {
          id: 'globalCustomFieldId1',
          type: 'permission',
        },
      },
      custom_field: {
        data: {
          id: 'globalCustomFieldId1',
          type: 'custom_field',
        },
      },
    },
  },
  {
    id: 'customFieldId2',
    type: 'permissions_custom_field',
    attributes: {
      required: false,
      created_at: 'created-at',
      updated_at: 'updated-at',
    },
    relationships: {
      permission: {
        data: {
          id: 'globalCustomFieldId2',
          type: 'permission',
        },
      },
      custom_field: {
        data: {
          id: 'globalCustomFieldId2',
          type: 'custom_field',
        },
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: permissionsCustomFieldsData } };
});
