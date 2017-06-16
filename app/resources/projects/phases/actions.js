/*
 *
 * resources/projects/phases actions
 *
 */

import { LOAD_PROJECT_PHASES_ERROR, LOAD_PROJECT_PHASES_REQUEST, LOAD_PROJECT_PHASES_SUCCESS } from './constants';

export function loadProjectPhasesRequest(projectId) {
  return {
    type: LOAD_PROJECT_PHASES_REQUEST,
    payload: projectId,
  };
}

export function loadProjectPhasesSuccess(response) {
  return {
    type: LOAD_PROJECT_PHASES_SUCCESS,
    payload: response,
  };
}

export function loadProjectPhasesError(error) {
  return {
    type: LOAD_PROJECT_PHASES_ERROR,
    error,
  };
}
