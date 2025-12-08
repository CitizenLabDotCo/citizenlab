import { RouteType } from 'routes';
import { API_PATH } from 'containers/App/constants';

import {
  invalidateQueryCache,
  resetMeQuery,
} from 'utils/cl-react-query/resetQueryCache';
import clHistory from 'utils/cl-router/history';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { endsWith } from 'utils/helperUtils';

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

  // Always do client-side cleanup
  await resetMeQuery();
  invalidateQueryCache();
  const { pathname } = removeLocale(location.pathname);

  if (
    pathname &&
    (endsWith(pathname, '/sign-up') || pathname.startsWith('/admin'))
  ) {
    clHistory.push('/');
  }

  /*
    TODO: Could probably be removed now that we have the Unauthorized component
    that renders if the user is not authenticated
  */
  if (pathname && endsWith(pathname, '/ideas/new')) {
    clHistory.push(pathname.split('/ideas/new')[0] as RouteType);
  }
}
