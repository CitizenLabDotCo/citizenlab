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
    author_id: authorId,
  };
  return request(`${API_PATH}/ideas`, null, null, queryParameters);
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

export function fetchIdeaComments(nextCommentPageNumber, nextCommentPageItemCount, ideaId) {
  const queryParameters = {
    'page[number]': nextCommentPageNumber,
    'page[size]': nextCommentPageItemCount,
  };

  return request(`${API_PATH}/ideas/${ideaId}/comments`, null, null, queryParameters);
}

export function createIdeaComment(ideaId, userId, htmlContents, parentId) {
  const body = {
    author_id: userId,
    body_multiloc: htmlContents,
    parent_id: parentId,
  };

  return request(`${API_PATH}/ideas/${ideaId}/comments`, { comment: body }, {
    method: 'POST',
  });
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
