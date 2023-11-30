import { IInitiativeAction } from 'api/initiative_action_descriptors/types';
import keys from './keys';
import { Keys } from 'utils/cl-react-query/types';
import { GLOBAL_CONTEXT } from './constants';
import { IPhasePermissionAction } from 'api/permissions/types';

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

export interface AuthenticationRequirementsResponse {
  data: {
    type: 'requirements';
    attributes: {
      requirements: AuthenticationRequirements;
    };
  };
}

type RequirementStatus = 'dont_ask' | 'require' | 'satisfied' | 'ask';

export type OnboardingType = {
  topics_and_areas?: RequirementStatus;
};

export interface AuthenticationRequirements {
  permitted: boolean;
  requirements: {
    built_in: {
      first_name: RequirementStatus;
      last_name: RequirementStatus;
      email: RequirementStatus;
    };
    custom_fields: Record<string, RequirementStatus>;
    onboarding: OnboardingType;
    special: {
      password: RequirementStatus;
      confirmation: RequirementStatus;
      verification: RequirementStatus;
      group_membership: RequirementStatus;
    };
  };
}

export type AuthenticationRequirementKeys = Keys<typeof keys>;
