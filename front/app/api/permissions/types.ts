import { IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import permissionsKeys from './keys';

export type PermissionsKeys = Keys<typeof permissionsKeys>;

// Actions of permissions that live outside of a phase.
export type IGlobalPermissionAction = 'following' | 'visiting';

export type IPhasePermissionAction =
  | 'posting_idea'
  | 'reacting_idea'
  | 'commenting_idea'
  | 'taking_survey'
  | 'taking_poll'
  | 'voting'
  | 'annotating_document'
  | 'attending_event'
  | 'volunteering';

export type Action = IGlobalPermissionAction | IPhasePermissionAction;

export type PermittedBy = 'everyone' | 'users' | 'admins_moderators';

export type UserDataCollection = 'all_data' | 'demographics_only' | 'anonymous';

export type UserFieldsInFormExplanation =
  | 'user_fields_in_form_not_supported_for_action'
  | 'with_these_settings_cannot_ask_demographic_fields'
  | 'cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone'
  | 'with_these_settings_can_only_ask_demographic_fields_in_registration_flow';

export type UserFieldsInFormFrontendDescriptor = {
  value: boolean | null;
  locked: boolean;
  explanation: UserFieldsInFormExplanation | null;
};

// Global and phase permissions are the same resource in the backend, so they
// are the same type here: a global permission is one without a scope.
export interface IPermissionData {
  id: string;
  type: 'permission';
  attributes: {
    access_denied_explanation_multiloc: Multiloc;
    action: Action;
    confirmed_email_expiry: number | null;
    created_at: string;
    everyone_tracking_enabled: boolean;
    global_custom_fields: boolean;
    permitted_by: PermittedBy;
    permitted_by_everyone_allowed: boolean;
    require_confirmed_email: boolean;
    require_confirmed_phone_number: boolean;
    confirmed_phone_number_expiry: number | null;
    require_name: boolean;
    require_password: boolean;
    require_verification: boolean;
    updated_at: string;
    user_data_collection: UserDataCollection;
    user_fields_in_form_descriptor: UserFieldsInFormFrontendDescriptor;
    verification_enabled: boolean;
    verification_expiry: number | null;
  };
  relationships: {
    permission_scope: {
      data: IRelationship | null;
    };
    groups: {
      data: IRelationship[];
    };
  };
}

export interface IPermissions {
  data: IPermissionData[];
}

export interface IPermission {
  data: IPermissionData;
}

export interface IPermissionUpdate {
  group_ids: string[];
  permitted_by: PermittedBy;
  global_custom_fields: boolean;
  verification_expiry: number | null;
  access_denied_explanation_multiloc: Multiloc;
  everyone_tracking_enabled: boolean;
  user_data_collection: UserDataCollection;
  user_fields_in_form: boolean;
  require_confirmed_email: boolean;
  confirmed_email_expiry: number | null;
  require_confirmed_phone_number: boolean;
  confirmed_phone_number_expiry: number | null;
  require_name: boolean;
  require_password: boolean;
  require_verification: boolean;
}

export type UpdateGlobalPermissionParams = {
  action: IGlobalPermissionAction;
  permission: Partial<IPermissionUpdate>;
};
