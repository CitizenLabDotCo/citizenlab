
import { UPDATE_CURRENT_USER_REQUEST, UPDATE_CURRENT_USER_SUCCESS, UPDATE_CURRENT_USER_ERROR } from './constants';

export function updateCurrentUserRequest(field, value) {
  return {
    type: UPDATE_CURRENT_USER_REQUEST,
    field,
    value,
  };
}

export function updateCurrentUserSuccess(field) {
  return {
    type: UPDATE_CURRENT_USER_SUCCESS,
    field,
  };
}

export function updateCurrentUserError(error) {
  return {
    type: UPDATE_CURRENT_USER_ERROR,
    error,
  };
}
