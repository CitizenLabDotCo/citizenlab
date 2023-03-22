import { getAndSetToken } from './signIn';
import { API_PATH } from 'containers/App/constants';
import { Locale } from 'typings';
import streams from 'utils/streams';
import { resetQueryCache } from 'utils/cl-react-query/resetQueryCache';

const createAccountPath = `${API_PATH}/users`;

const accountCreatedSuccessfully = (response: Response) => {
  return response.status === 200 || response.status === 201;
};

const emailIsTaken = async (response: Response) => {
  const json = await response.json();
  return !!json?.errors?.email?.some((error) => error.error === 'taken');
};

interface Parameters {
  email: string;
  locale: Locale;
}

export default async function createEmailOnlyAccount({
  email,
  locale,
}: Parameters) {
  const response = await fetch(createAccountPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user: { email, locale },
    }),
  });

  if (accountCreatedSuccessfully(response)) {
    await getAndSetToken({ email });

    await Promise.all([streams.reset(), resetQueryCache()]);

    return 'account_created_successfully';
  }

  if (await emailIsTaken(response)) {
    return 'email_taken';
  }

  return 'error';
}
