import { getAndSetToken } from '../sign_in_out/signIn';
import { Locale } from 'typings';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUser } from 'api/users/types';
import { CreateEmailOnlyAccountProperties } from './types';

const triggerCreateEmailOnlyAccount = (
  requestBody: CreateEmailOnlyAccountProperties
) => {
  return fetcher<IUser>({
    path: `/users`,
    action: 'post',
    body: requestBody,
  });
};

const emailIsTaken = async (response: Response) => {
  const json = await response.json();
  return !!json?.errors?.email?.some((error) => error.error === 'taken');
};

export interface Parameters {
  email: string;
  locale: Locale;
}

export default async function createEmailOnlyAccount({
  email,
  locale,
}: Parameters) {
  const bodyData = {
    user: { email, locale },
  };

  const response = await triggerCreateEmailOnlyAccount(bodyData);

  if (response.data) {
    await getAndSetToken({ email });
    invalidateQueryCache();
    return 'account_created_successfully';
  }

  if (await emailIsTaken(response.data)) {
    return 'email_taken';
  }

  throw new Error();
}
