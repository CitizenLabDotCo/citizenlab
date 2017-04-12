/*
 *
 * UsersShowPage actions
 *
 */

import {
  LOAD_USER_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_ERROR,
} from './constants';

export function loadUser(userId) {
  return {
    type: LOAD_USER_REQUEST,
    userId,
  };
}

export function userLoaded(response) {
  return {
    type: LOAD_USER_SUCCESS,
    payload: response,
  };
}

export function userLoadError(error) {
  return {
    type: LOAD_USER_ERROR,
    payload: error,
  };
}
