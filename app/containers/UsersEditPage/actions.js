/*
 *
 * UsersEditPage actions
 *
 */

import {
  LOAD_PROFILE, PROFILE_LOAD_SUCCESS, PROFILE_LOAD_ERROR,
  STORE_PROFILE, PROFILE_STORE_SUCCESS, PROFILE_STORE_ERROR, STORE_AVATAR, AVATAR_STORE_SUCCESS, AVATAR_LOAD_SUCCESS,
  AVATAR_LOAD_ERROR, AVATAR_STORE_ERROR, LOAD_AVATAR,
} from './constants';

export function loadProfile() {
  return {
    type: LOAD_PROFILE,
  };
}

export function profileLoaded(profile) {
  return {
    type: PROFILE_LOAD_SUCCESS,
    ...{ profile },
  };
}

export function profileLoadError() {
  return {
    type: PROFILE_LOAD_ERROR,
  };
}

export function storeProfile(values) {
  return {
    type: STORE_PROFILE,
    userData: values,
  };
}

export function profileStored(response, profile) {
  return {
    type: (response.success ? PROFILE_STORE_SUCCESS : PROFILE_STORE_ERROR),
    ...{ profile },
  };
}

export function storeProfileError(profile) {
  return {
    type: PROFILE_STORE_ERROR,
    ...{ profile },
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
    type: (avatar ? AVATAR_STORE_SUCCESS : AVATAR_STORE_SUCCESS),
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
    type: (avatar ? AVATAR_LOAD_SUCCESS : AVATAR_LOAD_SUCCESS),
    avatar,
  };
}

export function loadAvatarError() {
  return {
    type: AVATAR_LOAD_ERROR,
  };
}
