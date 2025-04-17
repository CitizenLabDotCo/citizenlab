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

export interface IPhasePermissionData {
  id: string;
  type: string;
  attributes: {
    access_denied_explanation_multiloc: Multiloc;
    action: IPhasePermissionAction;
    permitted_by: PermittedBy;
    created_at: string;
    updated_at: string;
    global_custom_fields: boolean;
    verification_enabled: boolean;
    verification_expiry: number | null;
    everyone_tracking_enabled: boolean;
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

export type PermittedBy =
  | 'everyone'
  | 'users'
  | 'admins_moderators'
  | 'everyone_confirmed_email'
  | 'verified';

interface IPermissionUpdate {
  group_ids: string[];
  permitted_by: PermittedBy;
  global_custom_fields: boolean;
  verification_expiry: number | null;
  access_denied_explanation_multiloc: Multiloc;
  everyone_tracking_enabled: boolean;
}
