import { IPermissionData } from '../types';

export const permissionsData: IPermissionData[] = [
  {
    id: '7ba05225-d56b-4a9b-848c-0c93560792ae',
    type: 'permission',
    attributes: {
      action: 'following',
      permitted_by: 'admins_moderators',
      global_custom_fields: false,
      created_at: '2023-08-01T14:22:08.000Z',
      updated_at: '2023-09-14T08:55:27.098Z',
      verification_enabled: false,
      verification_expiry: null,
      access_denied_explanation_multiloc: {},
      everyone_tracking_enabled: false,
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
