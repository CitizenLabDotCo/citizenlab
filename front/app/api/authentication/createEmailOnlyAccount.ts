import { API_PATH } from 'containers/App/constants';
import { Locale } from 'typings';

const path = `${API_PATH}/users`;

export default async function createEmailOnlyAccount(
  email: string,
  locale: Locale
) {
  return await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user: { email, locale },
    }),
  });
}
