import { IInitiativeAction } from 'api/initiative_action_descriptors/types';
import keys from './keys';
import { Keys } from 'utils/cl-react-query/types';
import { GLOBAL_CONTEXT } from './constants';
import { IParticipationContextPermissionAction } from 'services/actionPermissions';

interface InitiativeContext {
  type: 'initiative';
  action: IInitiativeAction;
}

export type IFollowingAction = 'following';

interface IFollowContext {
  type: 'follow';
  action: IFollowingAction;
}

export interface ProjectContext {
  type: 'project' | 'phase';
  action: IParticipationContextPermissionAction;
  id: string /* project or phase id, depending on type attribute */;
}

interface IdeaContext {
  type: 'idea';
  action: IParticipationContextPermissionAction;
  id: string /* idea id */;
}

export type AuthenticationContext =
  | typeof GLOBAL_CONTEXT
  | InitiativeContext
  | ProjectContext
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
