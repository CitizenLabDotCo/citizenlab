
import { UPDATE_CURRENT_USER_REQUEST, UPDATE_CURRENT_USER_SUCCESS, UPDATE_CURRENT_USER_ERROR, COMPLETE_USER_REGISTRATION } from './constants';

export function updateCurrentUserRequest(userId, field, value) {
  return {
    type: UPDATE_CURRENT_USER_REQUEST,
    userId,
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

export function completeUserRegistration(backTo) {
  return {
    type: COMPLETE_USER_REGISTRATION + backTo,
  };
}
