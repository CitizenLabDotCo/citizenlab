import {
  STORE_JWT,
  LOAD_CURRENT_USER_REQUEST,
  LOAD_CURRENT_USER_SUCCESS,
  LOAD_CURRENT_USER_ERROR,
} from './constants';

export function storeJwt(jwt) {
  return {
    type: STORE_JWT,
    payload: jwt,
  };
}

export function loadCurrentUserRequest() {
  return {
    type: LOAD_CURRENT_USER_REQUEST,
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
