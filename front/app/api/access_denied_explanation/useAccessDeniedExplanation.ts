import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';

import fetcher from 'utils/cl-react-query/fetcher';

import accessDeniedExplanationKeys from './keys';
import {
  AccessDeniedExplanationResponse,
  AccessDeniedExplanationKeys,
} from './types';

const useAccessDeniedExplanation = (
  authenticationContext: AuthenticationContext
) => {
  return useQuery<
    AccessDeniedExplanationResponse,
    CLErrors,
    AccessDeniedExplanationResponse,
    AccessDeniedExplanationKeys
  >({
    queryKey: accessDeniedExplanationKeys.item(authenticationContext),
    queryFn: () => fetchAccessDeniedExplanation(authenticationContext),
  });
};

const fetchAccessDeniedExplanation = (
  authenticationContext: AuthenticationContext
) => {
  const { type, action } = authenticationContext;

  if (type === 'global' || type === 'follow') {
    return fetcher<AccessDeniedExplanationResponse>({
      path: `/permissions/${action}/access_denied_explanation`,
      action: 'get',
    });
  }

  const { id } = authenticationContext;

  if (type === 'idea') {
    return fetcher<AccessDeniedExplanationResponse>({
      path: `/ideas/${id}/permissions/${action}/access_denied_explanation`,
      action: 'get',
    });
  }

  return fetcher<AccessDeniedExplanationResponse>({
    path: `/${type}s/${id}/permissions/${action}/access_denied_explanation`,
    action: 'get',
  });
};

export default useAccessDeniedExplanation;
