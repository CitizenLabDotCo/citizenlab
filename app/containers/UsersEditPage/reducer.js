/*
 *
 * UsersEditPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  LOAD_PROFILE, PROFILE_LOAD_SUCCESS, PROFILE_LOAD_ERROR,
  STORE_PROFILE, PROFILE_STORE_SUCCESS, PROFILE_STORE_ERROR, STORE_AVATAR, AVATAR_STORE_ERROR, AVATAR_STORE_SUCCESS,
  LOAD_AVATAR, AVATAR_LOAD_ERROR, AVATAR_LOAD_SUCCESS,
} from './constants';

export const usersEditPageInitialState = fromJS({
  loading: false,
  loadError: false,
  storeError: false,
  processing: false,
  stored: false,
  userData: { },
  avatarBase64: null,
  avatarStored: false,
  avatarLoadError: false,
  avatarStoreError: false,
});

export default function usersEditPageReducer(state = usersEditPageInitialState, action) {
  switch (action.type) {
    case LOAD_PROFILE:
      return state
        .set('loading', true)
        .set('loadError', false);
    case PROFILE_LOAD_SUCCESS:
      return state
        .set('userData', action.profile)
        .set('loading', false);
    case PROFILE_LOAD_ERROR:
      return state
        .set('loadError', true)
        .set('loading', false);
    case STORE_PROFILE:
      return state
        .set('stored', false)
        .set('processing', true)
        .set('storeError', false);
    case PROFILE_STORE_SUCCESS:
      return state
        .set('userData', action.profile)
        .set('processing', false)
        .set('stored', true);
    case PROFILE_STORE_ERROR:
      return state
        .set('userData', action.profile)
        .set('processing', false)
        .set('storeError', true);
    case STORE_AVATAR:
      return state
        .set('avatarLoadError', false)
        .set('avatarStoreError', false);
    case AVATAR_STORE_ERROR:
      return state
        .set('avatarStoreError', true);
    case AVATAR_STORE_SUCCESS:
      return state
        .set('avatarBase64', action.avatar);
    case LOAD_AVATAR:
      return state
        .set('avatarLoadError', false);
    case AVATAR_LOAD_ERROR:
      return state
        .set('avatarLoadError', true);
    case AVATAR_LOAD_SUCCESS:
      return state
        .set('avatarBase64', action.avatar);
    default:
      return state;
  }
}
