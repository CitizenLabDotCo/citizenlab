/*
 *
 * UsersEditPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  STORE_PROFILE, PROFILE_STORE_SUCCESS, PROFILE_STORE_ERROR, STORE_AVATAR, AVATAR_STORE_ERROR, AVATAR_STORE_SUCCESS,
  LOAD_AVATAR, AVATAR_LOAD_ERROR, AVATAR_LOAD_SUCCESS, CURRENT_USER_LOAD_SUCCESS, CURRENT_USER_LOAD_ERROR,
} from './constants';
import { LOAD_CURRENT_USER } from '../App/constants';

export const usersEditPageInitialState = fromJS({
  loading: false,
  loadError: false,
  storeError: false,
  processing: false,
  stored: false,
  currentUser: { },
  avatarBase64: null,
  avatarStored: false,
  avatarLoadError: false,
  avatarStoreError: false,
});

export default function usersEditPageReducer(state = usersEditPageInitialState, action) {
  switch (action.type) {
    case LOAD_CURRENT_USER:
      return state
        .set('loading', true)
        .set('loadError', false);
    case CURRENT_USER_LOAD_SUCCESS:
      return state
        .set('currentUser', action.payload.data.attributes)
        .set('loading', false);
    case CURRENT_USER_LOAD_ERROR:
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
        .set('currentUser', action.payload.data.attributes)
        .set('processing', false)
        .set('stored', true);
    case PROFILE_STORE_ERROR:
      return state
        // restore existing currentUserData to keep form state consistency
        .set('currentUser', state.get('currentUser').toJS())
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
