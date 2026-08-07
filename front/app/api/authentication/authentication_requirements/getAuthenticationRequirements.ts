import fetcher from 'utils/cl-react-query/fetcher';

import {
  AuthenticationContext,
  AuthenticationRequirementsResponse,
} from './types';

// The authentication state machine reads requirements at each decision point
// (e.g. after sign-in, to decide whether to run the success action) and MUST
// reflect the CURRENT auth state. Going through queryClient.fetchQuery with the
// app-wide staleTime: Infinity let a post-login read reuse — or dedupe into —
// the requirements request fired while logged out when the modal opened. The
// code then saw stale anonymous requirements (group_membership unmet,
// email_action_required: 'provide_email') and diverted permitted users to
// access-denied, silently dropping post-login actions such as the redirect to
// the idea form. Fetch directly so every decision-point read is fresh and
// carries the current token. Components observe requirements via the separate
// useAuthenticationRequirements hook and are unaffected.
const getAuthenticationRequirements = (
  authenticationContext: AuthenticationContext
) => {
  return fetchAuthenticationRequirements(authenticationContext);
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
