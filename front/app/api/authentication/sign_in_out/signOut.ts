import { API_PATH } from 'containers/App/constants';

import {
  invalidateQueryCache,
  resetMeQuery,
} from 'utils/cl-react-query/resetQueryCache';
import clHistory from 'utils/cl-router/history';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { endsWith, isPage } from 'utils/helperUtils';

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

const hasLogoutUrl = (body: unknown): body is { logout_url: string } =>
  typeof body === 'object' &&
  body !== null &&
  'logout_url' in body &&
  typeof body.logout_url === 'string';

/*
  Reads the URL to sign out at the user's SSO provider from an API response that
  signed the user out. Not every such response has one, or even a body.
*/
export async function logoutUrlFrom(
  response: Response
): Promise<string | null> {
  const text = await response.text();
  if (!text) return null;

  const body: unknown = JSON.parse(text);
  return hasLogoutUrl(body) ? body.logout_url : null;
}

/*
  Clears the HttpOnly auth cookie, which only the API can do.
  Returns the URL to sign out at the SSO provider the user signed in with,
  if that provider supports it.
*/
export async function signOutOnServer(): Promise<string | null> {
  try {
    const response = await fetch(`${API_PATH}/user_token`, {
      method: 'DELETE',
      credentials: 'include', // Include cookies (session, auth tokens)
    });
    if (response.status !== 200) return null;

    return await logoutUrlFrom(response);
  } catch (error) {
    console.error('Sign out failed:', error);
    return null;
  }
}

export default async function signOut() {
  const logoutUrl = await signOutOnServer();

  // Sign out at the SSO provider too. It sends the user back to the platform.
  if (logoutUrl) {
    window.location.href = logoutUrl;
    return;
  }

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
  if (pathname && isPage('idea_form', pathname)) {
    clHistory.push(pathname.split('/ideas/new')[0]);
  }
}
