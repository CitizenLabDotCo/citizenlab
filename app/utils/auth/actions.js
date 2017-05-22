import {
  STORE_JWT,
  LOAD_CURRENT_USER_REQUEST,
  LOAD_CURRENT_USER_SUCCESS,
  LOAD_CURRENT_USER_ERROR,
  SIGNIN_USER_REQUEST,
  SIGNIN_USER_ERROR,
  SIGNOUT_CURRENT_USER,
  DELETE_CURRENT_USER_LOCAL,
  SOCIAL_AUTH_REQUEST,
  SOCIAL_AUTH_SUCCESS,
  SOCIAL_AUTH_ERROR,
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

export function signInUserError(error) {
  return {
    type: SIGNIN_USER_ERROR,
    payload: error,
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


export function createSocialUserRequest(network, locale) {
  return {
    type: SOCIAL_AUTH_REQUEST,
    payload: { network, locale },
  };
}

export function createSocialUserSuccess(network, payload) {
  return {
    type: SOCIAL_AUTH_SUCCESS,
    payload,
  };
}

export function createSocialUserError(network, error) {
  return {
    type: SOCIAL_AUTH_ERROR,
    payload: { network, error },
  };
}

