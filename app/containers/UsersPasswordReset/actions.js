/*
 *
 * UsersPasswordReset actions
 *
 */

import { RESET_PASSWORD_ERROR, RESET_PASSWORD_REQUEST, RESET_PASSWORD_SUCCESS } from './constants';
export function resetPasswordRequest(password, token) {
  return {
    type: RESET_PASSWORD_REQUEST,
    password,
    token,
  };
}

export function resetPasswordSuccess() {
  return {
    type: RESET_PASSWORD_SUCCESS,
  };
}

export function resetPasswordError() {
  return {
    type: RESET_PASSWORD_ERROR,
  };
}
