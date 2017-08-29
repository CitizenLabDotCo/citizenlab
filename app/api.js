import request, { requestBlob } from 'utils/request';
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

export function fetchIdeas(queryParameters) {
  return request(`${API_PATH}/ideas`, null, null, queryParameters);
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

export function fetchIdeaBySlug(slug) {
  return request(`${API_PATH}/ideas/by_slug/${slug}`);
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

export function fetchUserBySlug(slug) {
  return request(`${API_PATH}/users/by_slug/${slug}`);
}

export function fetchIdeaComments(nextCommentPageNumber, nextCommentPageItemCount, ideaId) {
  const queryParameters = {
    'page[number]': nextCommentPageNumber,
    'page[size]': nextCommentPageItemCount,
  };

  return request(`${API_PATH}/ideas/${ideaId}/comments`, null, null, queryParameters);
}

export function createIdeaComment(ideaId, comment) {
  return request(`${API_PATH}/ideas/${ideaId}/comments`, { comment }, {
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

export function updateSettings(tenantId, body) {
  return request(`${API_PATH}/tenants/${tenantId}`, {
    tenant: body,
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

export function upvoteIdea(ideaId) {
  return request(`${API_PATH}/ideas/${ideaId}/votes/up`, {}, {
    method: 'POST',
  });
}

export function downvoteIdea(ideaId) {
  return request(`${API_PATH}/ideas/${ideaId}/votes/down`, {}, {
    method: 'POST',
  });
}

export function deleteIdeaVote(voteId) {
  return request(`${API_PATH}/votes/${voteId}`, {}, {
    method: 'DELETE',
  });
}

export function fetchUsersByGenderReport(queryParameters) {
  return request(`${API_PATH}/stats/users_by_gender`, null, null, queryParameters);
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

/*
 * projects
 */
export function fetchProjects(queryParameters) {
  return request(`${API_PATH}/projects`, null, null, queryParameters);
}

export function createProject(data) {
  return request(`${API_PATH}/projects`, { project: data }, {
    method: 'POST',
  });
}

export function updateProject(id, data) {
  return request(`${API_PATH}/projects/${id}`, { project: data }, {
    method: 'PUT',
  });
}

export function fetchProject(id) {
  return request(`${API_PATH}/projects/${id}`);
}

export function fetchProjectBySlug(slug) {
  return request(`${API_PATH}/projects/by_slug/${slug}`);
}

export function fetchProjectPhases(id) {
  return request(`${API_PATH}/projects/${id}/phases`);
}

export function fetchProjectEvents(id) {
  return request(`${API_PATH}/projects/${id}/events`);
}

export function deleteProject(id) {
  return request(`${API_PATH}/projects/${id}`, null, {
    method: 'DELETE',
  });
}


// areas
export function loadAreas(queryParameters) {
  return request(`${API_PATH}/areas`, null, null, queryParameters);
}

export function createArea(data) {
  return request(`${API_PATH}/areas`, { area: data }, {
    method: 'POST',
  });
}

export function updateArea(id, data) {
  return request(`${API_PATH}/areas/${id}`, { area: data }, {
    method: 'PUT',
  });
}

export function loadArea(id) {
  return request(`${API_PATH}/areas/${id}`);
}

export function deleteArea(id) {
  return request(`${API_PATH}/areas/${id}`, null, {
    method: 'DELETE',
  });
}

// resource
export function loadResources(type, queryParameters, search) {
  const railsfriendlySearch = (search || '').replace(/[[0-9]+]/g, '[]');
  return request(`${API_PATH}/${type}s${railsfriendlySearch}`, null, null, queryParameters);
}

export function createResource(type, data, ...extra) {
  let reqString = `${API_PATH}/${type}s`;
  if (extra[0]) reqString = `${API_PATH}/${extra.join('/')}`;
  return request(reqString, { [type]: data }, {
    method: 'POST',
  });
}

export function updateResource(type, id, data) {
  return request(`${API_PATH}/${type}s/${id}`, { [type]: data }, {
    method: 'PUT',
  });
}

export function loadResource(type, id) {
  return request(`${API_PATH}/${type}s/${id}`);
}

export function deleteResource(type, id) {
  return request(`${API_PATH}/${type}s/${id}`, null, {
    method: 'DELETE',
  });
}

/*
 * notifications
 */

export function fetchNotifications(queryParameters) {
  return request(`${API_PATH}/notifications`, null, null, queryParameters);
}

export function markNotificationRead(notificationId) {
  return request(`${API_PATH}/notifications/${notificationId}/mark_read`, null, {
    method: 'POST',
  });
}

export function markAllNotificationsRead() {
  return request(`${API_PATH}/notifications/mark_all_read`, null, {
    method: 'POST',
  });
}

/*
 * export
 */

export function fetchIdeasXlsx(project) {
  return requestBlob(
    `${API_PATH}/ideas/as_xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    { project }
  );
}

export function fetchCommentsXlsx(project) {
  return requestBlob(
    `${API_PATH}/comments/as_xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    { project }
  );
}

export function fetchUsersXlsx() {
  return requestBlob(
    `${API_PATH}/users/as_xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
}
