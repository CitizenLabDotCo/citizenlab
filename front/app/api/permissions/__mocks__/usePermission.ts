import { IPermissionData } from '../types';

export const permissionData: IPermissionData = {
  id: '4b6b0a1a-1d8b-4e8d-9b6d-6a4b3f0e2c11',
  type: 'permission',
  attributes: {
    action: 'visiting',
    permitted_by: 'users',
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
};

export default jest.fn(() => {
  return { data: { data: permissionData } };
});
