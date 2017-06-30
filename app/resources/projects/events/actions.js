/*
 *
 * resources/projects/events actions
 *
 */

import { LOAD_PROJECT_EVENTS_ERROR, LOAD_PROJECT_EVENTS_REQUEST, LOAD_PROJECT_EVENTS_SUCCESS } from './constants';

export function loadProjectEventsRequest(projectId) {
  return {
    type: LOAD_PROJECT_EVENTS_REQUEST,
    payload: projectId,
  };
}

export function loadProjectEventsSuccess(response) {
  return {
    type: LOAD_PROJECT_EVENTS_SUCCESS,
    payload: response,
  };
}

export function loadProjectEventsError(error) {
  return {
    type: LOAD_PROJECT_EVENTS_ERROR,
    error,
  };
}
