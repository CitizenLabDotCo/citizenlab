/*
 *
 * ProfilePage actions
 *
 */

import {
  LOAD_PROFILE, PROFILE_LOAD_SUCCESS, PROFILE_LOAD_ERROR,
  STORE_PROFILE, PROFILE_STORE_SUCCESS, PROFILE_STORE_ERROR,
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

export function storeProfileError(err, profile) {
  return {
    type: PROFILE_STORE_ERROR,
    ...{ profile },
  };
}
