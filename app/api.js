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

export function createIdea(values) {
  return request(`${API_PATH}/ideas`, { idea: values }, {
    method: 'POST',
  });
}

export function fetchIdeas(nextPageNumber, nextPageItemCount, authorId) {
  const queryParameters = {
    'page[number]': nextPageNumber,
    'page[size]': nextPageItemCount,
    author: authorId,
  };
  return request(`${API_PATH}/ideas`, null, null, queryParameters);
}

export function fetchTopics(nextPageNumber, nextPageItemCount) {
  const queryParameters = {
    'page[number]': nextPageNumber,
    'page[size]': nextPageItemCount,
  };
  return request(`${API_PATH}/topics`, null, null, queryParameters);
}

export function fetchIdea(id) {
  return request(`${API_PATH}/ideas/${id}`);
}

export function fetchCurrentUser() {
  return request(`${API_PATH}/users/me`);
}

export function fetchUser(userId) {
  return request(`${API_PATH}/users/${userId}`);
}

export function updateCurrentUser(values, userId) {
  // if post profile (no avatar), remove avatar
  return request(`${API_PATH}/users/${userId}`, { user: values }, {
    method: 'PUT',
  });
}

export function fetchCurrentTenant() {
  return request(`${API_PATH}/tenants/current`);
}
