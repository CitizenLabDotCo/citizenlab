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

export function socialRegister(network, accessToken, locale) {
  const data = {
    auth: {
      network,
      access_token: accessToken,
      locale,
    },
  };

  return request(`${API_PATH}/social_registration`, data, {
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

export function fetchIdeas(query, queryParameters) {
  const railsfriendlyQuery = (query || '').replace(/[[0-9]+]/g, '[]');
  return request(`${API_PATH}/ideas${railsfriendlyQuery}`, null, null, queryParameters);
}

export function fetchProjects(queryParameters) {
  return request(`${API_PATH}/projects`, null, null, queryParameters);
}

export function fetchTopics(queryParameters) {
  return request(`${API_PATH}/topics`, null, null, queryParameters);
}

export function fetchAreas(queryParameters) {
  return request(`${API_PATH}/areas`, null, null, queryParameters);
}

export function fetchIdea(id) {
  return request(`${API_PATH}/ideas/${id}`);
}

export function fetchCurrentUser() {
  return request(`${API_PATH}/users/me`);
}

export function fetchUsers(queryParameters) {
  return request(`${API_PATH}/users`, null, null, queryParameters);
}

export function fetchPage(pageId) {
  return request(`${API_PATH}/pages/${pageId}`);
}

export function fetchPages(queryParameters) {
  return request(`${API_PATH}/pages`, null, null, queryParameters);
}

export function createPage(body) {
  return request(`${API_PATH}/pages`, { page: body }, {
    method: 'POST',
  });
}

export function getRecoveryLink(email) {
  return request(`${API_PATH}/users/reset_password_email`, { user: {
    email,
  } }, {
    method: 'POST',
  });
}

export function resetPassword(password, token) {
  return request(`${API_PATH}/users/reset_password`, { user: {
    password,
    token,
  } }, {
    method: 'POST',
  });
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

export function createIdeaComment(ideaId, htmlContents, parentId) {
  const body = {
    body_multiloc: htmlContents,
    parent_id: parentId,
  };

  return request(`${API_PATH}/ideas/${ideaId}/comments`, { comment: body }, {
    method: 'POST',
  });
}


export function deleteIdeaComment(commentId) {
  return request(`${API_PATH}/comments/${commentId}`, null, {
    method: 'DELETE',
  });
}

export function updateCurrentUser(values, userId) {
  // if post profile (no avatar), remove avatar
  return request(`${API_PATH}/users/${userId}`, { user: values }, {
    method: 'PUT',
  });
}

export function updateSettings(tenantId, locale, organizationName, accentColorHex) {
  return request(`${API_PATH}/tenants/${tenantId}`, {
    tenant: {
      settings: {
        core: {
          organization_name: {
            [locale]: organizationName,
          },
          style_accent_bg: accentColorHex,
        },
      },
    },
  }, {
    method: 'PATCH',
  });
}

export function fetchCurrentTenant() {
  return request(`${API_PATH}/tenants/current`);
}

export function fetchIdeaVotes(ideaId) {
  return request(`${API_PATH}/ideas/${ideaId}/votes`);
}

export function submitIdeaVote(ideaId, mode) {
  const body = {
    vote: { mode },
  };

  return request(`${API_PATH}/ideas/${ideaId}/votes`, body, {
    method: 'POST',
  });
}

export function fetchUsersReport(queryParameters) {
  return request(`${API_PATH}/stats/users_by_time`, null, null, queryParameters);
}

export function fetchIdeaTopicsReport(queryParameters) {
  return request(`${API_PATH}/stats/ideas_by_topic`, null, null, queryParameters);
}

export function fetchIdeaAreasReport(queryParameters) {
  return request(`${API_PATH}/stats/ideas_by_area`, null, null, queryParameters);
}
