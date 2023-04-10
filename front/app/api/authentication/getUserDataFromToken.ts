import { API_PATH } from 'containers/App/constants';
import request from 'utils/request';
import { IUser } from 'services/users';

export default function getUserDataFromToken(token: string) {
  return request<IUser>(
    `${API_PATH}/users/by_invite/${token}`,
    null,
    { method: 'GET' },
    null
  );
}
