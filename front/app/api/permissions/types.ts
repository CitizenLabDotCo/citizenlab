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

export type AuthenticationContext = InitiativeContext | ProjectContext;

export interface AuthenticationRequirementsResponse {
  data: {
    type: 'requirements';
    requirements: AuthenticationRequirements;
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
