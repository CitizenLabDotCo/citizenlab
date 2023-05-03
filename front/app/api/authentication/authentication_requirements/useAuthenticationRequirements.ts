import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import { fetchAuthenticationRequirements } from './getAuthenticationRequirements';
import {
  AuthenticationContext,
  AuthenticationRequirementsResponse,
  AuthenticationRequirementKeys,
} from './types';
import requirementsKeys from './keys';

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
