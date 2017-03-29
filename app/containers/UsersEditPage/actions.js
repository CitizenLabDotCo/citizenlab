/*
 *
 * UsersEditPage actions
 *
 */

import {
  CURRENT_USER_LOAD_SUCCESS, CURRENT_USER_LOAD_ERROR,
  STORE_PROFILE, PROFILE_STORE_SUCCESS, PROFILE_STORE_ERROR, STORE_AVATAR, AVATAR_STORE_SUCCESS, AVATAR_LOAD_SUCCESS,
  AVATAR_LOAD_ERROR, AVATAR_STORE_ERROR, LOAD_AVATAR,
} from './constants';

export function currentUserLoaded(currentUser) {
  return {
    type: (currentUser && currentUser.data
      ? CURRENT_USER_LOAD_SUCCESS
      : CURRENT_USER_LOAD_ERROR),
    payload: currentUser,
  };
}

export function currentUserLoadError() {
  return {
    type: CURRENT_USER_LOAD_ERROR,
  };
}

export function storeProfile(values) {
  return {
    type: STORE_PROFILE,
    userData: values,
  };
}

export function profileStored(profile) {
  return {
    type: (profile ? PROFILE_STORE_SUCCESS : PROFILE_STORE_ERROR),
    ...{ profile },
  };
}

export function storeProfileError() {
  return {
    type: PROFILE_STORE_ERROR,
  };
}

export function storeAvatar(avatar) {
  return {
    type: STORE_AVATAR,
    avatar,
  };
}

export function avatarStored(avatar) {
  return {
    type: (avatar ? AVATAR_STORE_SUCCESS : AVATAR_STORE_ERROR),
    avatar,
  };
}

export function storeAvatarError() {
  return {
    type: AVATAR_STORE_ERROR,
  };
}

export function loadAvatar() {
  return {
    type: LOAD_AVATAR,
  };
}

export function avatarLoaded(avatar) {
  return {
    type: (avatar ? AVATAR_LOAD_SUCCESS : AVATAR_LOAD_ERROR),
    avatar,
  };
}

export function loadAvatarError() {
  return {
    type: AVATAR_LOAD_ERROR,
  };
}
