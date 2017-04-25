/*
 *
 * UsersNewPage reducer
 *
 */

import { fromJS } from 'immutable';
import { CREATE_USER_ERROR, CREATE_USER_REQUEST, CREATE_USER_SUCCESS } from './constants';

export const initialState = fromJS({
  pending: false,
  error: null,
  newUser: null,
});

function usersNewPageReducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_USER_REQUEST:
      return state.set('pending', true);
    case CREATE_USER_SUCCESS:
      return state
        .set('pending', false)
        .set('error', null)
        .set('newUser', action.payload);
    case CREATE_USER_ERROR:
      return state
        .set('pending', false)
        .set('newUser', null)
        .set('error', action.payload);
    default:
      return state;
  }
}

export default usersNewPageReducer;
