import { IRelationship, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import phasePermissionKeys from './keys';

export type PhasePermissionKeys = Keys<typeof phasePermissionKeys>;

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

export type UserDataCollection = 'all_data' | 'demographics_only' | 'anonymous';

// Which contact details a participant has to confirm before they can act.
// 'either_email_or_phone' is satisfied by whichever of the two they have - the
// reason this is one enum rather than two independent booleans.
export type EmailAndPhoneRequirements =
  | 'neither'
  | 'email_only'
  | 'phone_only'
  | 'both_email_and_phone'
  | 'either_email_or_phone';

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

export interface IPhasePermissionData {
  id: string;
  type: string;
  attributes: {
    access_denied_explanation_multiloc: Multiloc;
    action: IPhasePermissionAction;
    confirmed_email_expiry: number | null;
    created_at: string;
    everyone_tracking_enabled: boolean;
    global_custom_fields: boolean;
    permitted_by: PermittedBy;
    permitted_by_everyone_allowed: boolean;
    email_and_phone_requirements: EmailAndPhoneRequirements;
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
      data: IRelationship;
    };
    groups: {
      data: IRelationship[];
    };
  };
}

export interface IPhasePermissions {
  data: IPhasePermissionData[];
}

export interface IPhasePermission {
  data: IPhasePermissionData;
}

export type UpdatePermissionParams = {
  permissionId: string;
  phaseId: string;
  action: IPhasePermissionAction;
  permission: Partial<IPermissionUpdate>;
};

export type ResetPermissionParams = {
  permissionId: string;
  phaseId: string;
  action: IPhasePermissionAction;
};

export type PermittedBy = 'everyone' | 'users' | 'admins_moderators';

export interface IPermissionUpdate {
  group_ids: string[];
  permitted_by: PermittedBy;
  global_custom_fields: boolean;
  verification_expiry: number | null;
  access_denied_explanation_multiloc: Multiloc;
  everyone_tracking_enabled: boolean;
  email_and_phone_requirements: EmailAndPhoneRequirements;
  confirmed_email_expiry: number | null;
  confirmed_phone_number_expiry: number | null;
  require_name: boolean;
  require_password: boolean;
  require_verification: boolean;
}
