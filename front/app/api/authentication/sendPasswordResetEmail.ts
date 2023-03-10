import { IHttpMethod } from 'typings';
import request from 'utils/request';
import { API_PATH } from 'containers/App/constants';

export default async function sendPasswordResetMail(email: string) {
  // eslint-disable-next-line no-useless-catch
  try {
    const bodyData = {
      user: {
        email,
      },
    };
    const httpMethod: IHttpMethod = { method: 'POST' };
    const response = await request(
      `${API_PATH}/users/reset_password_email`,
      bodyData,
      httpMethod,
      null
    );
    return response;
  } catch (error) {
    throw error;
  }
}
