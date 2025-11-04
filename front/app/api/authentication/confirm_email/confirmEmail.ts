import { HighestRole } from 'api/users/types';

import { setJwt } from 'utils/auth/jwt';
import fetcher from 'utils/cl-react-query/fetcher';
import { invalidateQueryCache } from 'utils/cl-react-query/resetQueryCache';

const confirmationApiEndpoint = `user/confirm`;

type IConfirmation = {
  email: string;
  code: string;
};

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

export default async function confirmEmail(confirmation: IConfirmation) {
  const bodyData = {
    confirmation,
  };

  try {
    const res = await fetcher<Response>({
      path: `/${confirmationApiEndpoint}`,
      action: 'post',
      body: bodyData,
    });

    setJwt(res.data.attributes.auth_token.token, false);
    invalidateQueryCache();

    return true;
  } catch (errors) {
    throw errors.errors;
  }
}
