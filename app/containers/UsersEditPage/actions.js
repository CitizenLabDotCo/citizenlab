/*
 *
 * UsersEditPage actions
 *
 */

import {
  LOAD_CURRENT_USER_SUCCESS, LOAD_CURRENT_USER_ERROR, STORE_AVATAR, UPDATE_CURRENT_USER_SUCCESS,
  UPDATE_CURRENT_USER_ERROR, UPDATE_CURRENT_USER, STORE_AVATAR_ERROR, UPDATE_USER_LOCALE, STORE_AVATAR_SUCCESS,
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
    payload: currentUser.data.attributes,
    userId: currentUser.data.id,
  };
}

export function loadCurrentUserError() {
  return {
    type: LOAD_CURRENT_USER_ERROR,
  };
}

export function updateCurrentUser(currentUser) {
  return {
    type: UPDATE_CURRENT_USER,
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

export function updateCurrentUserSuccess(currentUser) {
  const validResponse = !!(currentUser && currentUser.data);
  const currentUserWithAvatar = currentUser;

  if (validResponse && !currentUserWithAvatar.data.attributes.avatar) {
    currentUserWithAvatar.data.attributes.avatar = '';
  }

  return {
    type: (validResponse
        ? UPDATE_CURRENT_USER_SUCCESS
        : UPDATE_CURRENT_USER_ERROR),
    payload: validResponse && currentUser.data.attributes,
    userId: currentUser.data.id,
  };
}

export function updateCurrentUserError() {
  return {
    type: UPDATE_CURRENT_USER_ERROR,
  };
}

export function storeAvatar(avatarBase64, userId) {
  return {
    type: STORE_AVATAR,
    avatarBase64,
    userId,
  };
}

export function storeAvatarSuccess() {
  return {
    type: STORE_AVATAR_SUCCESS,
  };
}

export function storeAvatarError() {
  return {
    type: STORE_AVATAR_ERROR,
  };
}
