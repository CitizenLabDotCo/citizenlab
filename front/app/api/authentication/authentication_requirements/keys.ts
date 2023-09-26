import { QueryKeys } from 'utils/cl-react-query/types';
import { AuthenticationContext } from './types';

const baseKey = {
  type: 'requirements',
};
const requirementKeys = {
  all: () => [baseKey],
  item: (authenticationContext: AuthenticationContext) => [
    { ...baseKey, operation: 'item', parameters: { authenticationContext } },
  ],
} satisfies QueryKeys;

export default requirementKeys;
