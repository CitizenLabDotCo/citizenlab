import request from 'utils/request';
import { API_PATH } from 'containers/App/constants';

export function socialLogin(network, accessToken) {
  const data = {
    auth: {
      network,
      access_token: accessToken,
    },
  };

  return request(`${API_PATH}/social_login`, data, {
    method: 'POST',
  });
}

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
  socialLogin,
};
