/*
 *
 * ProjectsIndexPage actions
 *
 */

import {
  LOAD_PROJECTS_ERROR, LOAD_PROJECTS_REQUEST, LOAD_PROJECTS_SUCCESS, RESET_PROJECTS,
} from './constants';

export function loadProjectsRequest(initialLoad, nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_PROJECTS_REQUEST,
    initialLoad,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function loadProjectsSuccess(response) {
  return {
    type: LOAD_PROJECTS_SUCCESS,
    payload: response,
  };
}

export function loadProjectsError(error) {
  return {
    type: LOAD_PROJECTS_ERROR,
    error,
  };
}

export function resetProjects() {
  return {
    type: RESET_PROJECTS,
  };
}
