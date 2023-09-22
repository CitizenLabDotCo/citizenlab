import { QueryKeys } from 'utils/cl-react-query/types';
import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';

const baseType = { type: 'custom_fields_json_forms_schema' };
const schemaKeys = {
  all: () => [baseType],
  item: (authenticationContext: AuthenticationContext) => [
    { ...baseType, operation: 'item', parameters: { authenticationContext } },
  ],
} satisfies QueryKeys;

export default schemaKeys;
