import { RouteType } from 'routes';

import { getJwt, removeJwt, decode } from 'utils/auth/jwt';
import {
  invalidateQueryCache,
  resetMeQuery,
} from 'utils/cl-react-query/resetQueryCache';
import clHistory from 'utils/cl-router/history';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { endsWith } from 'utils/helperUtils';

import logoutUrl from './logoutUrl';

export default async function signOut() {
  const jwt = getJwt();

  if (jwt) {
    const decodedJwt = decode(jwt);

    removeJwt();

    if (decodedJwt.logout_supported) {
      const url = await logoutUrl(decodedJwt);
      window.location.href = url;
    } else {
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
  }
}
