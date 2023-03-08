import { AuthenticationContext } from './types';

const authenticationRequirementKeys = {
  all: () => [{ type: 'requirement' }],
  item: (authenticationContext: AuthenticationContext) => [
    {
      ...authenticationRequirementKeys.all()[0],
      authenticationContext,
    },
  ],
} as const;

export default authenticationRequirementKeys;
