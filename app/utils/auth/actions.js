import {
  STORE_JWT,
  LOAD_CURRENT_USER_REQUEST,
  LOAD_CURRENT_USER_SUCCESS,
  LOAD_CURRENT_USER_ERROR,
  SIGNIN_USER_REQUEST,
  SIGNOUT_CURRENT_USER,
  DELETE_CURRENT_USER_LOCAL,
} from './constants';

export function storeJwt(jwt) {
  return {
    type: STORE_JWT,
    payload: jwt,
  };
}

export function loadCurrentUserRequest(currentUser) {
  return {
    type: LOAD_CURRENT_USER_REQUEST,
    currentUser,
  };
}

export function loadCurrentUserSuccess(response) {
  return {
    type: LOAD_CURRENT_USER_SUCCESS,
    payload: response,
  };
}

export function loadCurrentUserError(error) {
  return {
    type: LOAD_CURRENT_USER_ERROR,
    payload: error,
  };
}

export function signInUserRequest(email, password, currentUser) {
  return {
    type: SIGNIN_USER_REQUEST,
    email,
    password,
    currentUser,
  };
}

export function signOutCurrentUser() {
  return {
    type: SIGNOUT_CURRENT_USER,
  };
}

export function deleteCurrentUserLocal() {
  return {
    type: DELETE_CURRENT_USER_LOCAL,
  };
}

