import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import authenticationRequirementKeys from './keys';
import {
  AuthenticationContext,
  AuthenticationRequirementsResponse,
  AuthenticationRequirementKeys,
} from './types';

const fetchAuthenticationRequirements = (
  authenticationContext: AuthenticationContext
) => {
  const { type, action } = authenticationContext;

  if (type === 'initiative') {
    return fetcher<AuthenticationRequirementsResponse>({
      path: `/permissions/${action}/requirements`,
      action: 'get',
    });
  }

  const { id } = authenticationContext;

  return fetcher<AuthenticationRequirementsResponse>({
    path: `/${type}s/${id}/permissions/${action}/requirements`,
    action: 'get',
  });
};

const useAuthenticationRequirements = (
  authenticationContext: AuthenticationContext
) => {
  return useQuery<
    AuthenticationRequirementsResponse,
    CLErrors,
    AuthenticationRequirementsResponse,
    AuthenticationRequirementKeys
  >({
    queryKey: authenticationRequirementKeys.item(authenticationContext),
    queryFn: () => fetchAuthenticationRequirements(authenticationContext),
  });
};

export default useAuthenticationRequirements;
