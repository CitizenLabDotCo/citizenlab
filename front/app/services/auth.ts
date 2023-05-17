import { IUser } from 'api/users/types';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

export const authApiEndpoint = `${API_PATH}/users/me`;

export function authUserStream() {
  return streams.get<IUser | null>({ apiEndpoint: authApiEndpoint });
}

export interface ILockedField {
  type: 'locked_attribute';
  id: string;
  attributes: {
    name: 'first_name' | 'last_name' | 'email';
  };
}

export function lockedFieldsStream() {
  return streams.get<{ data: ILockedField[] }>({
    apiEndpoint: `${authApiEndpoint}/locked_attributes`,
  });
}
