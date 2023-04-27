import { AUTH_PATH } from 'containers/App/constants';
import { getJwt, removeJwt, decode } from 'utils/auth/jwt';
import { endsWith } from 'utils/helperUtils';
import streams from 'utils/streams';
import clHistory from 'utils/cl-router/history';
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

export default async function signOut() {
  const jwt = getJwt();

  if (jwt) {
    const decodedJwt = decode(jwt);

    removeJwt();
    if (decodedJwt.logout_supported) {
      const { provider, sub } = decodedJwt;
      const url = `${AUTH_PATH}/${provider}/logout?user_id=${sub}`;
      window.location.href = url;
    } else {
      await streams.reset();
      await resetQueryCache();
      const { pathname } = removeLocale(location.pathname);
      if (
        pathname &&
        (endsWith(pathname, '/sign-up') || pathname.startsWith('/admin'))
      ) {
        clHistory.push('/');
      }

      if (pathname && endsWith(pathname, '/ideas/new')) {
        clHistory.push(pathname.split('/ideas/new')[0]);
      }
    }
  }
}
