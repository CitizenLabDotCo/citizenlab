import { HighestRole } from 'api/users/types';

import { setJwt } from 'utils/auth/jwt';
import fetcher from 'utils/cl-react-query/fetcher';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

type Response = {
  data: {
    type: 'create';
    attributes: {
      auth_token: {
        payload: {
          exp: number;
          cluster: string;
          highest_role: HighestRole;
          sub: string;
          tenant: string;
        };
        token: string;
      };
    };
  };
};

export const confirmEmailConfirmationCodeUnauthenticated = async (
  email: string,
  code: string
) => {
  try {
    const res = await fetcher<Response>({
      path: `/user/confirm_code_unauthenticated`,
      action: 'post',
      body: {
        confirmation: { email, code },
      },
    });

    setJwt(res.data.attributes.auth_token.token, false);
    invalidateQueryCache();

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};

export const confirmEmailConfirmationCodeChangeEmail = async (code: string) => {
  try {
    await fetcher({
      path: `/user/confirm_code_email_change`,
      action: 'post',
      body: {
        confirmation: { code },
      },
    });
    return true;
  } catch (errors) {
    throw errors.errors;
  }
};
