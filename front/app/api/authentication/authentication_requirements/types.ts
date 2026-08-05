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

// The email step the user must still complete for this permission (or null when
// there is nothing to do). Mirrors the backend
// Permissions::UserRequirementsService#email_action_required.
export type EmailAction =
  | 'provide_email'
  | 'confirm_email'
  // `email` was confirmed before but has aged past confirmed_email_expiry. Same
  // step as confirm_email, but no code was auto-sent, so the frontend requests one.
  | 'reconfirm_email'
  | 'provide_new_email'
  | 'confirm_new_email';

// The phone step the user must still complete (or null). Mirrors the backend
// #phone_action_required. `provide_phone` is reserved for a not-yet-built flow.
export type PhoneAction =
  | 'provide_phone'
  | 'confirm_phone'
  // `phone` was confirmed before but has aged past confirmed_phone_number_expiry.
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
          email_action_required: EmailAction | null;
          phone_action_required: PhoneAction | null;
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
