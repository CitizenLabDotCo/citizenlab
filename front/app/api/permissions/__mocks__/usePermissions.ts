import { IPermissionData } from '../types';

export const permissionsData: IPermissionData[] = [
  {
    id: '7ba05225-d56b-4a9b-848c-0c93560792ae',
    type: 'permission',
    attributes: {
      action: 'following',
      permitted_by: 'admins_moderators',
      custom_fields_behavior: 'global',
      created_at: '2023-08-01T14:22:08.000Z',
      updated_at: '2023-09-14T08:55:27.098Z',
      verification_enabled: false,
      verification_expiry: null,
      access_denied_explanation_multiloc: {},
      everyone_tracking_enabled: false,
      require_confirmed_email: true,
      confirmed_email_expiry: null,
      require_confirmed_phone_number: false,
      confirmed_phone_number_expiry: null,
      require_name: true,
      require_password: true,
      require_verification: false,
      permitted_by_everyone_allowed: false,
      inherited: false,
      user_data_collection: 'all_data',
      user_fields_in_form_descriptor: {
        value: null,
        locked: true,
        explanation: 'user_fields_in_form_not_supported_for_action',
      },
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
