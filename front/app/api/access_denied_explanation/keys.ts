import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';

import { QueryKeys } from 'utils/cl-react-query/types';

const baseType = { type: 'access_denied_explanation' };
const schemaKeys = {
  all: () => [baseType],
  item: (authenticationContext: AuthenticationContext) => [
    { ...baseType, operation: 'item', parameters: { authenticationContext } },
  ],
} satisfies QueryKeys;

export default schemaKeys;
