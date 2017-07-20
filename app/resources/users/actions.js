/*
 *
 * resources/users actions
 *
 */

import {
  LOAD_USERS_ERROR, LOAD_USERS_REQUEST, LOAD_USERS_SUCCESS, RESET_USERS, LOAD_USER_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_ERROR, DELETE_USER_REQUEST, DELETE_USER_SUCCESS, DELETE_USER_ERROR, CREATE_USER_SUCCESS } from './constants';

export function loadUsersRequest(queryParams) {
  return {
    type: LOAD_USERS_REQUEST,
    queryParams,
  };
}

export function loadUsersSuccess(response) {
  return {
    type: LOAD_USERS_SUCCESS,
    payload: response,
  };
}

export function loadUsersError(error) {
  return {
    type: LOAD_USERS_ERROR,
    error,
  };
}

export function loadUserRequest(id) {
  return {
    type: LOAD_USER_REQUEST,
    id,
  };
}

export function loadUserSuccess(response) {
  return {
    type: LOAD_USER_SUCCESS,
    payload: response,
  };
}

export function loadUserError(error) {
  return {
    type: LOAD_USER_ERROR,
    error,
  };
}

export function createUserSuccess(response) {
  return {
    type: CREATE_USER_SUCCESS,
    payload: response,
  };
}

export function deleteUserRequest(id) {
  return {
    type: DELETE_USER_REQUEST,
    id,
  };
}

export function deleteUserSuccess(id) {
  return {
    type: DELETE_USER_SUCCESS,
    id,
  };
}

export function deleteUserError(error) {
  return {
    type: DELETE_USER_ERROR,
    error,
  };
}

export function resetUsers() {
  return {
    type: RESET_USERS,
  };
}
