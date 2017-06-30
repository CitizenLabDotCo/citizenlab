/*
 *
 * resources/projects/pages actions
 *
 */

import { LOAD_PROJECT_PAGES_ERROR, LOAD_PROJECT_PAGES_REQUEST, LOAD_PROJECT_PAGES_SUCCESS } from './constants';

export function loadProjectPagesRequest(projectId) {
  return {
    type: LOAD_PROJECT_PAGES_REQUEST,
    payload: projectId,
  };
}

export function loadProjectPagesSuccess(response) {
  return {
    type: LOAD_PROJECT_PAGES_SUCCESS,
    payload: response,
  };
}

export function loadProjectPagesError(error) {
  return {
    type: LOAD_PROJECT_PAGES_ERROR,
    error,
  };
}
