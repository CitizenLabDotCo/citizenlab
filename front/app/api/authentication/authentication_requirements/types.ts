import { IInitiativeAction } from 'api/initiative_action_descriptors/types';
import {
  IPhasePermissionAction,
  PermittedBy,
} from 'api/phase_permissions/types';

import { DisabledReason } from 'utils/actionDescriptors/types';
import { Keys } from 'utils/cl-react-query/types';

import { GLOBAL_CONTEXT } from './constants';
import keys from './keys';

interface InitiativeContext {
  type: 'initiative';
  action: IInitiativeAction;
}

export type IFollowingAction = 'following';

interface IFollowContext {
  type: 'follow';
  action: IFollowingAction;
}

export interface PhaseContext {
  type: 'phase';
  action: IPhasePermissionAction;
  id: string /* phase id */;
}

interface IdeaContext {
  type: 'idea';
  action: IPhasePermissionAction;
  id: string /* idea id */;
}

export type AuthenticationContext =
  | typeof GLOBAL_CONTEXT
  | InitiativeContext
  | PhaseContext
  | IdeaContext
  | IFollowContext;

type UserAttribute =
  | 'first_name'
  | 'last_name'
  | 'email'
  | 'password'
  | 'confirmation';

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
