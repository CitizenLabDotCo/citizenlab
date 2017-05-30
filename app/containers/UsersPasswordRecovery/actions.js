/*
 *
 * UsersPasswordRecovery actions
 *
 */


import { SEND_RECOVERY_LINK_ERROR, SEND_RECOVERY_LINK_REQUEST, SEND_RECOVERY_LINK_SUCCESS } from './constants';

export function sendRecoveryLinkRequest(email) {
  return {
    type: SEND_RECOVERY_LINK_REQUEST,
    email,
  };
}

export function sendRecoveryLinkSuccess() {
  return {
    type: SEND_RECOVERY_LINK_SUCCESS,
  };
}

export function sendRecoveryLinkError() {
  return {
    type: SEND_RECOVERY_LINK_ERROR,
  };
}
