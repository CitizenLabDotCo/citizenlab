import fetcher from 'utils/cl-react-query/fetcher';
import {
  AuthenticationContext,
  AuthenticationRequirementsResponse,
} from './types';

const getAuthenticationRequirements = (
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
