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

export function profileLoaded() {
  return {
    type: PROFILE_LOAD_SUCCESS,
  };
}

export function profileLoadError() {
  return {
    type: PROFILE_LOAD_ERROR,
  };
}

export function storeProfile(values) {
  // console.log(values);
  return {
    type: STORE_PROFILE,
    userData: values,
  };
}

export function profileStored() {
  return {
    type: PROFILE_STORE_SUCCESS,
  };
}

export function storeProfileError() {
  return {
    type: PROFILE_STORE_ERROR,
  };
}
