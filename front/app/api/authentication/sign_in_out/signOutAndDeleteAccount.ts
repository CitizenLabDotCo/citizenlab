import { deleteUser } from 'services/users';
import { AUTH_PATH } from 'containers/App/constants';
import { getJwt, removeJwt, decode } from 'utils/auth/jwt';
import streams from 'utils/streams';
import clHistory from 'utils/cl-router/history';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

export default function signOutAndDeleteAccount() {
  return new Promise((resolve, _reject) => {
    const jwt = getJwt();

    if (jwt) {
      const decodedJwt = decode(jwt);

      const { provider, sub } = decodedJwt;

      deleteUser(sub)
        .then(async (_res) => {
          removeJwt();
          if (decodedJwt.logout_supported) {
            const url = `${AUTH_PATH}/${provider}/logout?user_id=${sub}`;
            window.location.href = url;
          } else {
            await streams.reset();
            await resetQueryCache();
          }
          clHistory.push('/');
          resolve(true);
        })
        .catch((_res) => {
          resolve(false);
        });
    }
  });
}
