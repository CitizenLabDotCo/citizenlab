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
    fetcher<AuthenticationRequirementsResponse>({
      path: `/permissions/${action}/requirements`,
      action: 'get',
    });
  } else {
    const { id } = authenticationContext;

    fetcher<AuthenticationRequirementsResponse>({
      path: `/${type}s/${id}/permissions/${action}/requirements`,
      action: 'get',
    });
  }
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
  } as any);
};

export default useAuthenticationRequirements;
