import { IInitiativeAction } from 'api/initiative_action_descriptors/types';
import { IPCAction } from 'typings';

interface InitiativeContext {
  type: 'initiative';
  action: IInitiativeAction;
}

export interface ProjectContext {
  type: 'project' | 'phase';
  action: IPCAction;
  id: string /* project or phase id, depending on type attribute */;
}

interface IdeaContext {
  type: 'idea';
  action: IPCAction;
  id: string /* idea id */;
}

export type AuthenticationContext =
  | InitiativeContext
  | ProjectContext
  | IdeaContext;

export interface AuthenticationRequirementsResponse {
  data: {
    type: 'requirements';
    attributes: {
      requirements: AuthenticationRequirements;
    };
  };
}

type RequirementStatus = 'dont_ask' | 'require' | 'satisfied';

export interface AuthenticationRequirements {
  permitted: boolean;
  requirements: {
    built_in: {
      first_name: RequirementStatus;
      last_name: RequirementStatus;
      email: RequirementStatus;
    };

    custom_fields: Record<string, RequirementStatus>;

    special: {
      password: RequirementStatus;
      confirmation: RequirementStatus;
    };
  };
}
