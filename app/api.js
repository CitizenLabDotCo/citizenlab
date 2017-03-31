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

export function fetchIdeas() {
  return request(`${API_PATH}/ideas`);
}

export function fetchCurrentUser() {
  return request(`${API_PATH}/users/me`);
}

export function updateCurrentUser(values) {
    // TODO: after merge with master use selector `makeSelectCurrentUser` at utils/auth/selectors to fetch userId
    // debugger;
    const userId = '193e5828-50d0-47b5-963f-4995dfe23876';
    return request(`${API_PATH}/users/${userId}`, { user: values },  {
        method: 'PUT',
    });
}

export default {
  login,
  socialLogin,
  createUser,
  fetchIdeas,
  fetchCurrentUser,
};
