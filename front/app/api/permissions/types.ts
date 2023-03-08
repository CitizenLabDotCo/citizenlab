import { IInitiativeAction } from 'services/initiatives';
import { IPCAction } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import authenticationRequirementKeys from './keys';

export type AuthenticationRequirementKeys = Keys<
  typeof authenticationRequirementKeys
>;

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
    id: string;
    type: 'requirements';
    requirements: AuthenticationRequirements;
  };
}

type RequirementStatus = 'dont_ask' | 'require' | 'satisfied';

interface AuthenticationRequirements {
  permitted: boolean;
  requirements: {
    built_in: {
      first_name: RequirementStatus;
      last_name: RequirementStatus;
      email: RequirementStatus;
    };

    custom_fields: {
      // TODO
    };

    special: {
      password: RequirementStatus;
      confirmation: RequirementStatus;
    };
  };
}
