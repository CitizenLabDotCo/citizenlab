import { IRelationship, Multiloc } from 'typings';

import {
  IPhasePermissionAction,
  IPhasePermissionData,
  PermittedBy,
} from 'api/phase_permissions/types';

import { Keys } from 'utils/cl-react-query/types';

import permissionsKeys from './keys';

export type PermissionsKeys = Keys<typeof permissionsKeys>;

export type IGlobalPermissionAction = 'following';

export type UserDataCollection = 'all_data' | 'demographics_only' | 'anonymous';

export type UserFieldsInFormExplanation =
  | 'user_fields_in_survey_not_supported_for_participation_method'
  | 'with_these_settings_cannot_ask_demographic_fields'
  | 'cannot_ask_demographic_fields_in_registration_flow_when_permitted_by_is_everyone'
  | 'with_these_settings_can_only_ask_demographic_fields_in_registration_flow';

export type UserFieldsInFormFrontendDescriptor = {
  value: boolean | null;
  locked: boolean;
  explanation: UserFieldsInFormExplanation | null;
};

export interface IGlobalPermissionData {
  id: string;
  type: 'permission';
  attributes: {
    access_denied_explanation_multiloc: Multiloc;
    action: IGlobalPermissionAction;
    permitted_by: PermittedBy;
    created_at: string;
    updated_at: string;
    global_custom_fields: boolean;
    verification_enabled: boolean;
    verification_expiry: number | null;
    everyone_tracking_enabled: boolean;
    user_data_collection: UserDataCollection;
    user_fields_in_form: boolean;
    user_fields_in_form_frontend_descriptor: UserFieldsInFormFrontendDescriptor;
  };
  relationships: {
    permission_scope: {
      data: null;
    };
    groups: {
      data: IRelationship[];
    };
  };
}

export type Action = IGlobalPermissionAction | IPhasePermissionAction;

export type IPermissionData = IPhasePermissionData | IGlobalPermissionData;

export interface IGlobalPermissions {
  data: IGlobalPermissionData[];
}

export interface IGlobalPermission {
  data: IGlobalPermissionData;
}

export interface PermissionUpdateParams {
  id: string;
  action: IGlobalPermissionAction;
  group_ids: string[];
  permitted_by: PermittedBy;
  global_custom_fields: boolean;
  verification_expiry: number | null;
  access_denied_explanation_multiloc: Multiloc;
}
