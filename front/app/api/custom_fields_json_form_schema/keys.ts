import { QueryKeys } from 'utils/cl-react-query/types';
import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';

const schemaKeys = {
  all: () => [{ type: 'custom_fields_json_forms_schema' }],
  item: (authenticationContext: AuthenticationContext) => [
    { ...schemaKeys.all()[0], authenticationContext },
  ],
} satisfies QueryKeys;

export default schemaKeys;
