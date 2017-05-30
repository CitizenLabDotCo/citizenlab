/*
 *
 * SignInPage actions
 *
 */

import {
 AUTHENTICATE_EMAIL_REQUEST,
 AUTHENTICATE_EMAIL_SUCCESS,
 AUTHENTICATE_EMAIL_ERROR,
 AUTHENTICATE_SOCIAL_REQUEST,
 AUTHENTICATE_SOCIAL_SUCCESS,
 AUTHENTICATE_SOCIAL_ERROR,
} from './constants';

export function authenticateEmailRequest(credentials) {
  return {
    type: AUTHENTICATE_EMAIL_REQUEST,
    payload: credentials,
  };
}

export function authenticateEmailSuccess(response) {
  return {
    type: AUTHENTICATE_EMAIL_SUCCESS,
    payload: response,
  };
}

export function authenticateEmailError(error) {
  return {
    type: AUTHENTICATE_EMAIL_ERROR,
    payload: error,
  };
}

export function authenticateSocialRequest(network) {
  return {
    type: AUTHENTICATE_SOCIAL_REQUEST,
    payload: network,
  };
}

export function authenticateSocialSuccess(network) {
  return {
    type: AUTHENTICATE_SOCIAL_SUCCESS,
    payload: network,
  };
}

export function authenticateSocialError(network) {
  return {
    type: AUTHENTICATE_SOCIAL_ERROR,
    payload: network,
  };
}
