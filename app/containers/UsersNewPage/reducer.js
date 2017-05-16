/*
 *
 * UsersNewPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CREATE_EMAIL_USER_ERROR, CREATE_EMAIL_USER_REQUEST, CREATE_EMAIL_USER_SUCCESS,
  CREATE_SOCIAL_USER_ERROR, CREATE_SOCIAL_USER_REQUEST, CREATE_SOCIAL_USER_SUCCESS,
 } from './constants';

export const initialState = fromJS({
  pending: false,
  error: null,
});

function usersNewPageReducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_EMAIL_USER_REQUEST:
      return state.set('pending', true);
    case CREATE_SOCIAL_USER_REQUEST:
      return state.set('pending', true);
    case CREATE_EMAIL_USER_SUCCESS:
      return state
        .set('pending', false)
        .set('error', null);
    case CREATE_SOCIAL_USER_SUCCESS:
      return state
        .set('pending', false)
        .set('error', null);
    case CREATE_EMAIL_USER_ERROR:
      return state
        .set('pending', false)
        .set('error', action.payload);
    case CREATE_SOCIAL_USER_ERROR:
      return state
        .set('pending', false)
        .set('error', action.payload);
    default:
      return state;
  }
}

export default usersNewPageReducer;
