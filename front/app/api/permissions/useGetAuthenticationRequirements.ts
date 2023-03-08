import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import {
  AuthenticationContext,
  AuthenticationRequirementsResponse,
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

const useGetAuthenticationRequirements = (
  authenticationContext: AuthenticationContext
) => {
  const { mutate, ...other } = useMutation<
    AuthenticationRequirementsResponse,
    CLErrors
  >({
    mutationFn: () => fetchAuthenticationRequirements(authenticationContext),
  });

  return { get: mutate, ...other };
};

export default useGetAuthenticationRequirements;
