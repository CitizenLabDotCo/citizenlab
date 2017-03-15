/*
 *
 * ProfilePage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  LOAD_PROFILE, PROFILE_LOAD_SUCCESS, PROFILE_LOAD_ERROR,
  STORE_PROFILE, PROFILE_STORE_SUCCESS, PROFILE_STORE_ERROR,
} from './constants';

const profilePageInitialState = fromJS({
  loading: false,
  loadError: false,
  storeError: false,
  processing: false,
  stored: false,
  userData: { },
});

export default function profilePageReducer(state = profilePageInitialState, action) {
  switch (action.type) {
    case LOAD_PROFILE:
      return state
        .set('loading', true)
        .set('loadError', false);
    case PROFILE_LOAD_SUCCESS:
      return state
        .setIn(['userData', 'user'], action.profile)
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
        .set('processing', false)
        .set('stored', true);
    case PROFILE_STORE_ERROR:
      return state
        .set('processing', false)
        .set('storeError', true);
    default:
      return state;
  }
}
