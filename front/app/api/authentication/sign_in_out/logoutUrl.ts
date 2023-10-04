import { IDecodedJwt } from 'utils/auth/jwt';

import { AUTH_PATH } from 'containers/App/constants';

export default async function logoutUrl(decodedJwt: IDecodedJwt | null) {
  if (decodedJwt?.logout_supported) {
    const { provider, sub } = decodedJwt;
    const logoutDataUrl = `${AUTH_PATH}/${provider}/logout_data?user_id=${sub}`;
    const logoutUrl = (await (await fetch(logoutDataUrl)).json()).url;
    return logoutUrl;
  } else {
    return null;
  }
}
