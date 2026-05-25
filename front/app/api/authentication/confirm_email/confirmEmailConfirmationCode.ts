import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import meKeys from 'api/me/keys';
import { HighestRole } from 'api/users/types';


import { setJwt } from 'utils/auth/jwt';
import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';
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

    queryClient.invalidateQueries({ queryKey: meKeys.all() });
    queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};
