import { QueryKeys } from 'utils/cl-react-query/types';
import { AuthenticationContext } from './types';

const requirementKeys = {
  all: () => [{ type: 'requirements' }],
  item: (authenticationContext: AuthenticationContext) => [
    { ...requirementKeys.all()[0], authenticationContext },
  ],
} satisfies QueryKeys;

export default requirementKeys;
