import { IPermissionsFieldData } from '../types';

export const permissionsFieldsData: IPermissionsFieldData[] = [
  {
    id: 'customFieldId1',
    type: 'permissions_field',
    attributes: {
      config: {},
      created_at: 'created-at',
      enabled: true,
      field_type: 'custom_field',
      locked: false,
      ordering: 0,
      required: false,
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
    type: 'permissions_field',
    attributes: {
      config: {},
      created_at: 'created-at',
      enabled: true,
      field_type: 'custom_field',
      locked: false,
      ordering: 1,
      required: false,
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
  return { data: { data: permissionsFieldsData } };
});
