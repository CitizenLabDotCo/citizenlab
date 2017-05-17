
import { UPDATE_CURRENT_USER_REQUEST, UPDATE_CURRENT_USER_SUCCESS, UPDATE_CURRENT_USER_ERROR } from './constants';

export function updateCurrentUserRequest(userId, field, value, callback) {
  return {
    type: UPDATE_CURRENT_USER_REQUEST,
    userId,
    field,
    value,
    callback,
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
