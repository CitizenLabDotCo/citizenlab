import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { fetchAuthenticationRequirements } from './getAuthenticationRequirements';
import requirementsKeys from './keys';
import {
  AuthenticationContext,
  AuthenticationRequirementsResponse,
  AuthenticationRequirementKeys,
} from './types';

const useAuthenticationRequirements = (
  authenticationContext: AuthenticationContext
) => {
  return useQuery<
    AuthenticationRequirementsResponse,
    CLErrors,
    AuthenticationRequirementsResponse,
    AuthenticationRequirementKeys
  >({
    queryKey: requirementsKeys.item(authenticationContext),
    queryFn: () => fetchAuthenticationRequirements(authenticationContext),
  });
};

export default useAuthenticationRequirements;
