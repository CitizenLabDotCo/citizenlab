import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

import requirementsKeys from './keys';
import {
  AuthenticationContext,
  AuthenticationRequirementsResponse,
} from './types';

const getAuthenticationRequirements = (
  authenticationContext: AuthenticationContext
) => {
  return queryClient.fetchQuery(
    requirementsKeys.item(authenticationContext),
    () => fetchAuthenticationRequirements(authenticationContext)
  );
};

export const fetchAuthenticationRequirements = (
  authenticationContext: AuthenticationContext
) => {
  const { type, action } = authenticationContext;

  if (type === 'global' || type === 'follow') {
    return fetcher<AuthenticationRequirementsResponse>({
      path: `/permissions/${action}/requirements`,
      action: 'get',
    });
  }

  const { id } = authenticationContext;

  if (type === 'idea') {
    return fetcher<AuthenticationRequirementsResponse>({
      path: `/ideas/${id}/permissions/${action}/requirements`,
      action: 'get',
    });
  }

  return fetcher<AuthenticationRequirementsResponse>({
    path: `/${type}s/${id}/permissions/${action}/requirements`,
    action: 'get',
  });
};

export default getAuthenticationRequirements;
