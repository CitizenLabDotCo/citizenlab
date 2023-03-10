import { API_PATH } from 'containers/App/constants';
import { Locale } from 'typings';

const createAccountPath = `${API_PATH}/users`;
// const userTokenPath = `${API_PATH}/user_token`;

const accountCreatedSuccessfully = (response: Response) => {
  return response.status === 200 || response.status === 201;
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
    // const response = await fetch(userTokenPath);
  }
}
