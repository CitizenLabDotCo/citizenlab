import request from 'utils/request';
import { API_PATH } from 'containers/App/constants';

export function createUser(values) {
  return request(`${API_PATH}/users`, { user: values }, {
    method: 'POST',
  });
}

export function fetchIdeas() {
  return request(`${API_PATH}/ideas`);
}

export default {
  createUser,
  fetchIdeas,
};
