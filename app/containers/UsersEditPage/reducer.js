/*
 *
 * UsersEditPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  STORE_AVATAR, CURRENT_USER_LOAD_SUCCESS, CURRENT_USER_LOAD_ERROR, STORE_CURRENT_USER, CURRENT_USER_STORE_SUCCESS,
  CURRENT_USER_STORE_ERROR, AVATAR_STORE_ERROR,
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
  avatarUploadError: false,
});

export default function usersEditPageReducer(state = usersEditPageInitialState, action) {
  switch (action.type) {
    case LOAD_CURRENT_USER:
      return state
        .set('loading', true)
        .set('loadError', false);
    case CURRENT_USER_LOAD_SUCCESS:
      return state
        .set('currentUser', action.payload)
        .set('loading', false);
    case CURRENT_USER_LOAD_ERROR:
      return state
        .set('loadError', true)
        .set('loading', false);
    case STORE_CURRENT_USER:
      return state
        .set('stored', false)
        .set('processing', true)
        .set('storeError', false);
    case CURRENT_USER_STORE_SUCCESS:
      return state
        .set('currentUser', action.payload)
        .set('processing', false)
        .set('stored', true);
    case CURRENT_USER_STORE_ERROR:
      return state
        // restore existing currentUserData to keep form state consistency
        .set('currentUser', state.get('currentUser'))
        .set('processing', false)
        .set('storeError', true);
    case STORE_AVATAR:
      return state
        .set('avatarUploadError', false)
        .set('avatarBase64', action.avatar);
    case AVATAR_STORE_ERROR:
      return state
        .set('avatarUploadError', true);
    default:
      return state;
  }
}
