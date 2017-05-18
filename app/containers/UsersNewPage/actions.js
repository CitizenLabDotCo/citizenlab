/*
 *
 * UsersNewPage actions
 *
 */

import {
  CREATE_EMAIL_USER_REQUEST,
  CREATE_EMAIL_USER_SUCCESS,
  CREATE_EMAIL_USER_ERROR,
  CREATE_SOCIAL_USER_REQUEST,
  CREATE_SOCIAL_USER_SUCCESS,
  CREATE_SOCIAL_USER_ERROR,
} from './constants';

export function createEmailUserRequest(payload, backTo) {
  return {
    type: CREATE_EMAIL_USER_REQUEST,
    payload,
    backTo,
  };
}

export function createEmailUserSuccess(payload) {
  return {
    type: CREATE_EMAIL_USER_SUCCESS,
    payload,
  };
}

export function createEmailUserError(payload) {
  return {
    type: CREATE_EMAIL_USER_ERROR,
    payload,
  };
}

export function createSocialUserRequest(network, locale) {
  return {
    type: CREATE_SOCIAL_USER_REQUEST,
    payload: { network, locale },
  };
}

export function createSocialUserSuccess(network, payload) {
  return {
    type: CREATE_SOCIAL_USER_SUCCESS,
    payload,
  };
}

export function createSocialUserError(network, error) {
  return {
    type: CREATE_SOCIAL_USER_ERROR,
    payload: { network, error },
  };
}
