import { AuthenticationContext } from './types';

const requirementsKeys = {
  all: () => [{ type: 'requirements' }],
  item: (authenticationContext: AuthenticationContext) => [
    { ...requirementsKeys.all()[0], ...authenticationContext },
  ],
};

export default requirementsKeys;
