import { IHttpMethod } from 'typings';
import request from 'utils/request';
import { API_PATH } from 'containers/App/constants';

interface Parameters {
  password: string;
  token: string;
}

export default async function resetPassword({ password, token }: Parameters) {
  // eslint-disable-next-line no-useless-catch
  try {
    const bodyData = {
      user: {
        password,
        token,
      },
    };
    const httpMethod: IHttpMethod = { method: 'POST' };
    const response = await request(
      `${API_PATH}/users/reset_password`,
      bodyData,
      httpMethod,
      null
    );
    return response;
  } catch (error) {
    throw error;
  }
}
