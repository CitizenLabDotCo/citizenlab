import { IPermissionData } from '../types';

export const permissionsData: IPermissionData[] = [
  {
    id: '7ba05225-d56b-4a9b-848c-0c93560792ae',
    type: 'permission',
    attributes: {
      action: 'posting_initiative',
      permitted_by: 'admins_moderators',
      global_custom_fields: false,
      created_at: '2023-08-01T14:22:08.000Z',
      updated_at: '2023-09-14T08:55:27.098Z',
    },
    relationships: {
      permission_scope: {
        data: null,
      },
      groups: {
        data: [],
      },
    },
  },
  {
    id: '94e48abe-ef73-45f8-bb24-431f2352670c',
    type: 'permission',
    attributes: {
      action: 'commenting_initiative',
      permitted_by: 'users',
      global_custom_fields: true,
      created_at: '2023-08-01T14:22:08.000Z',
      updated_at: '2023-08-01T14:22:08.000Z',
    },
    relationships: {
      permission_scope: {
        data: null,
      },
      groups: {
        data: [],
      },
    },
  },
];

export default jest.fn(() => {
  return { data: { data: permissionsData } };
});
