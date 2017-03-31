/*
 *
 * UsersEditPage actions
 *
 */

import {
  CURRENT_USER_LOAD_SUCCESS, CURRENT_USER_LOAD_ERROR, STORE_AVATAR, CURRENT_USER_STORE_SUCCESS,
  CURRENT_USER_STORE_ERROR, STORE_CURRENT_USER, AVATAR_STORE_ERROR,
} from './constants';

export function currentUserLoaded(currentUser) {
  return {
    type: (currentUser && currentUser.data
      ? CURRENT_USER_LOAD_SUCCESS
      : CURRENT_USER_LOAD_ERROR),
    payload: currentUser && currentUser.data && currentUser.data.attributes,
  };
}

export function currentUserLoadError() {
  return {
    type: CURRENT_USER_LOAD_ERROR,
  };
}

export function updateCurrentUser(currentUser) {console.log(currentUser);
  // rename avatar
  const user = currentUser;
  user.avatar = user.avatarBase64;
  delete user.avatarBase64;

  return {
    type: STORE_CURRENT_USER,
    payload: currentUser,
  };
}

export function currentUserUpdated(currentUser) {
    return {
      type: (currentUser && currentUser.data
          ? CURRENT_USER_LOAD_SUCCESS
          : CURRENT_USER_LOAD_ERROR),
      payload: currentUser && currentUser.data && currentUser.data.attributes,
  };
}

export function storeCurrentUserError() {
  return {
    type: CURRENT_USER_STORE_ERROR,
  };
}

export function storeAvatar(avatar) {
  return {
    type: STORE_AVATAR,
    avatar,
  };
}

export function avatarStoreError() {
  return {
    type: AVATAR_STORE_ERROR,
  };
}
