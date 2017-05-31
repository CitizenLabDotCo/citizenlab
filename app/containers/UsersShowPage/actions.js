/*
 *
 * UsersShowPage actions
 *
 */

import {
  LOAD_USER_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_ERROR, LOAD_USER_IDEAS_REQUEST, LOAD_USER_IDEAS_SUCCESS,
  LOAD_USER_IDEAS_ERROR,
} from './constants';

export function loadUserRequest(userId) {
  return {
    type: LOAD_USER_REQUEST,
    userId,
  };
}

export function loadUserSuccess(response) {
  return {
    type: LOAD_USER_SUCCESS,
    payload: response,
  };
}

export function loadUserError(errors) {
  return {
    type: LOAD_USER_ERROR,
    errors,
  };
}

export function loadUserIdeasRequest(userId) {
  return {
    type: LOAD_USER_IDEAS_REQUEST,
    userId,
  };
}

export function loadUserIdeasSuccess(response) {
  return {
    type: LOAD_USER_IDEAS_SUCCESS,
    payload: response,
  };
}

export function loadUserIdeasError(error) {
  return {
    type: LOAD_USER_IDEAS_ERROR,
    payload: error,
  };
}
