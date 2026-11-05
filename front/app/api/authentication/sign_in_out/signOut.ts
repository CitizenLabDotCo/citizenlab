import { API_PATH } from 'containers/App/constants';

import { removeJwt } from 'utils/auth/jwt';
import {
  invalidateQueryCache,
  resetMeQuery,
} from 'utils/cl-react-query/resetQueryCache';
import clHistory from 'utils/cl-router/history';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { endsWith } from 'utils/helperUtils';

/*
  Pages a user signing out should be redirected away from.
  /admin listed separately to match on all admin paths
*/
const PATHS_TO_REDIRECT = [
  '/sign-up',
  '/profile/edit',
  '/profile/change-email',
  '/profile/change-password',
  '/profile/change-phone',
];

export default async function signOut() {
  try {
    // Call backend to clear the HttpOnly cookie
    await fetch(`${API_PATH}/user_token`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies (session, auth tokens)
    });
  } catch (error) {
    console.error('Sign out failed:', error);
  }

  // Clears any JS-readable token left over and marks the removal as
  // deliberate, so it is not reported as an unexpected token loss.
  removeJwt();

  // Always do client-side cleanup
  await resetMeQuery();
  invalidateQueryCache();
  const { pathname } = removeLocale(location.pathname);

  if (
    pathname &&
    (endsWith(pathname, PATHS_TO_REDIRECT) || pathname.startsWith('/admin'))
  ) {
    clHistory.push('/');
  }

  /*
    TODO: Could probably be removed now that we have the Unauthorized component
    that renders if the user is not authenticated
  */
  if (pathname && endsWith(pathname, '/ideas/new')) {
    clHistory.push(pathname.split('/ideas/new')[0]);
  }
}
