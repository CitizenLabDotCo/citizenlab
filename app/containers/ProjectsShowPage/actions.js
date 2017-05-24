/*
 *
 * IdeasShow actions
 *
 */

import { LOAD_PROJECT_REQUEST, LOAD_PROJECT_SUCCESS, LOAD_PROJECT_ERROR } from './constants';

export function loadProjectRequest(payload) {
  return {
    type: LOAD_PROJECT_REQUEST,
    payload,
  };
}

export function loadProjectSuccess(payload) {
  return {
    type: LOAD_PROJECT_SUCCESS,
    payload,
  };
}

export function loadProjectError(error) {
  return {
    type: LOAD_PROJECT_ERROR,
    error,
  };
}
