/*
 *
 * UsersEditPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  STORE_AVATAR, LOAD_CURRENT_USER_SUCCESS, LOAD_CURRENT_USER_ERROR, UPDATE_CURRENT_USER, UPDATE_CURRENT_USER_SUCCESS, UPDATE_CURRENT_USER_ERROR, STORE_AVATAR_ERROR, UPDATE_USER_LOCALE,
  STORE_AVATAR_SUCCESS,
} from './constants';
import { LOAD_CURRENT_USER } from '../App/constants';

export const usersEditPageInitialState = fromJS({
  loading: false,
  loadError: false,
  storeError: false,
  processing: false,
  stored: false,
  currentUser: fromJS({ }),
  avatarStored: false,
  avatarUploadError: false,
  avatarURL: '',
});

export default function usersEditPageReducer(state = usersEditPageInitialState, action) {
  let currentUserWithId;

  if (action.payload) {
    const userId = action.userId;
    if (userId) {
      currentUserWithId = fromJS(action.payload).set('userId', userId);
    }
  }

  switch (action.type) {
    case LOAD_CURRENT_USER:
      return state
        .set('loading', true)
        .set('loadError', false);
    case LOAD_CURRENT_USER_SUCCESS:
      return state
        .set('currentUser', currentUserWithId)
        .set('loading', false);
    case LOAD_CURRENT_USER_ERROR:
      return state
        .set('loadError', true)
        .set('loading', false);
    case UPDATE_CURRENT_USER:
      return state
        .set('currentUser', currentUserWithId)
        .set('stored', false)
        .set('processing', true)
        .set('storeError', false);
    case UPDATE_CURRENT_USER_SUCCESS:
      return state
        .set('processing', false)
        .set('stored', true);
    case UPDATE_CURRENT_USER_ERROR:
      return state
        // restore existing currentUser data to keep form state consistency
        .set('currentUser', state.get('currentUser'))
        .set('processing', false)
        .set('storeError', true);
    case STORE_AVATAR:
      return state
        .set('avatarUploadError', false)
        .set('currentUser', fromJS(state.get('currentUser')).set('avatar', action.avatarBase64));
    case STORE_AVATAR_SUCCESS:
      return state
        .set('avatarUploadError', false);
    case STORE_AVATAR_ERROR:
      return state
        .set('avatarUploadError', true);
    case UPDATE_USER_LOCALE:
      return state
        .set('currentUser', fromJS(state.get('currentUser')).set('locale', action.userLocale));
    default:
      return state;
  }
}
