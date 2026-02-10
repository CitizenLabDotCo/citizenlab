import { IPermissionsPhaseCustomFieldData } from '../types';

export const permissionsPhaseCustomFieldsData: IPermissionsPhaseCustomFieldData[] =
  [
    {
      id: 'customFieldId1',
      type: 'permissions_custom_field',
      attributes: {
        created_at: 'created-at',
        lock: null,
        ordering: 0,
        persisted: true,
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
      type: 'permissions_custom_field',
      attributes: {
        created_at: 'created-at',
        lock: null,
        ordering: 0,
        persisted: true,
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
  return { data: { data: permissionsPhaseCustomFieldsData } };
});
