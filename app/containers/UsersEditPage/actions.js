/*
 *
 * UsersEditPage actions
 *
 */

import {
  LOAD_CURRENT_USER_SUCCESS, LOAD_CURRENT_USER_ERROR, STORE_AVATAR_REQUEST,
  UPDATE_CURRENT_USER_SUCCESS, UPDATE_CURRENT_USER_ERROR, STORE_AVATAR_ERROR, UPDATE_USER_LOCALE,
  UPDATE_CURRENT_USER_REQUEST,
} from './constants';

export function loadCurrentUserSuccess(currentUser) {
  const validResponse = currentUser && currentUser.data;
  const currentUserWithAvatar = currentUser;

  if (!validResponse) {
    return {
      type: 'LOAD_CURRENT_USER_ERROR',
    };
  }

  currentUserWithAvatar.data.attributes.avatar =
    (validResponse && currentUserWithAvatar.data.attributes.avatar
      ? currentUserWithAvatar.data.attributes.avatar.medium
      : '');

  return {
    type: LOAD_CURRENT_USER_SUCCESS,
    payload: currentUserWithAvatar.data.attributes,
    userId: currentUserWithAvatar.data.id,
  };
}

export function loadCurrentUserError() {
  return {
    type: LOAD_CURRENT_USER_ERROR,
  };
}

export function updateCurrentUser(currentUser) {
  return {
    type: UPDATE_CURRENT_USER_REQUEST,
    payload: currentUser,
    userId: currentUser.userId,
  };
}

export function updateLocale(userLocale) {
  return {
    type: UPDATE_USER_LOCALE,
    userLocale,
  };
}

export function updateCurrentUserSuccess() {
  return {
    type: UPDATE_CURRENT_USER_SUCCESS,
  };
}

export function updateCurrentUserError(errors) {
  return {
    type: UPDATE_CURRENT_USER_ERROR,
    errors,
  };
}

export function storeAvatar(avatarBase64, userId) {
  return {
    type: STORE_AVATAR_REQUEST,
    avatarBase64,
    userId,
  };
}

export function storeAvatarError() {
  return {
    type: STORE_AVATAR_ERROR,
  };
}
