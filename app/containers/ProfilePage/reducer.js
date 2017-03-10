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

const initialState = fromJS({
  loading: false,
  loaded: false,
  error: false,
  processing: false,
  stored: false,
  userData: { },
});

export default function profilePageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_PROFILE:
      return state
        .set('loading', true)
        .set('error', false);
    case PROFILE_LOAD_SUCCESS:
      // debugger
      return state
        .set('userData', action.profile)
        .set('loading', false)
        .set('loaded', false);
    case PROFILE_LOAD_ERROR:
      return state
        .set('error', action.error)
        .set('loading', false);
    case STORE_PROFILE:
      return state
        .set('stored', false)
        .set('processing', true)
        .set('error', false);
    case PROFILE_STORE_SUCCESS:
      return state
        .set('processing', false)
        .set('stored', true);
    case PROFILE_STORE_ERROR:
      return state
        .set('processing', false)
        .set('error', action.error);
    default:
      return state;
  }
}
