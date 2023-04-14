import { AuthenticationContext } from './types';

const requirementKeys = {
  all: () => [{ type: 'requirements' }],
  item: (authenticationContext: AuthenticationContext) => [
    { ...requirementKeys.all()[0], authenticationContext },
  ],
} as const;

export default requirementKeys;
