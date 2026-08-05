import {
  IPhasePermissionAction,
  PermittedBy,
} from 'api/phase_permissions/types';

import { DisabledReason } from 'utils/actionDescriptors/types';
import { Keys } from 'utils/cl-react-query/types';

import { GLOBAL_CONTEXT } from './constants';
import keys from './keys';

export type IFollowingAction = 'following';

interface IFollowContext {
  type: 'follow';
  action: IFollowingAction;
}

export interface PhaseContext {
  type: 'phase';
  action: IPhasePermissionAction;
  id: string;
}

interface IdeaContext {
  type: 'idea';
  action: IPhasePermissionAction;
  id: string /* idea id */;
}

export type AuthenticationContext =
  | typeof GLOBAL_CONTEXT
  | PhaseContext
  | IdeaContext
  | IFollowContext;

type UserAttribute = 'first_name' | 'last_name' | 'password';

// The single step the user must still complete before they can act (or null when
// there is nothing to do). Mirrors the backend
// Permissions::UserRequirementsService#action_required_for_access.
export type ActionRequiredForAccess =
  | 'authenticate'
  | 'confirm_email'
  | 'reconfirm_email'
  | 'provide_new_email'
  | 'confirm_new_email'
  | 'confirm_phone'
  | 'reconfirm_phone'
  | 'provide_new_phone'
  | 'confirm_new_phone';

export interface AuthenticationRequirementsResponse {
  data: {
    type: 'requirements';
    attributes: {
      permitted: boolean;
      disabled_reason: DisabledReason | null;
      requirements: {
        authentication: {
          permitted_by: PermittedBy;
          missing_user_attributes: UserAttribute[];
          action_required_for_access: ActionRequiredForAccess | null;
        };
        verification: boolean;
        custom_fields: Record<string, 'required' | 'optional'>;
        onboarding: boolean;
        group_membership: boolean;
      };
    };
  };
}

export type AuthenticationRequirementKeys = Keys<typeof keys>;

export type AuthenticationRequirements =
  AuthenticationRequirementsResponse['data']['attributes'];
