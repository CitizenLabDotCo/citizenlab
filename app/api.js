import request from 'utils/request';
import { API_PATH } from 'containers/App/constants';

export function login(email, password) {
  const data = {
    auth: {
      email,
      password,
    },
  };

  return request(`${API_PATH}/user_token`, data, {
    method: 'POST',
  });
}

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

export function fetchIdeas(url) {
  return request(url || `${API_PATH}/ideas`);
}

export function fetchCurrentUser() {
  return request(`${API_PATH}/users/me`);
}

export function fetchCurrentTenant() {
  return request(`${API_PATH}/tenants/current`);
}

export default {
  login,
  socialLogin,
  createUser,
  fetchIdeas,
  fetchCurrentUser,
  fetchCurrentTenant,
};
