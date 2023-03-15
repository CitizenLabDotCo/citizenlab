import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';
import {
  AuthenticationContext,
  AuthenticationRequirementsResponse,
} from './types';
import requirementsKeys from './keys';

const getAuthenticationRequirements = (
  authenticationContext: AuthenticationContext
) => {
  return queryClient.fetchQuery(
    requirementsKeys.item(authenticationContext),
    () => fetchAuthenticationRequirements(authenticationContext)
  );
};

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

export default getAuthenticationRequirements;
