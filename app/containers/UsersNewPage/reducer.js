/*
 *
 * UsersNewPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  CREATE_USER_PENDING,
  CREATE_USER_FULFILLED,
  CREATE_USER_REJECTED,
} from './constants';

export const initialState = fromJS({
  pending: false,
  error: null,
  newUser: null,
});

function usersNewPageReducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_USER_PENDING:
      return state.set('pending', true);
    case CREATE_USER_FULFILLED:
      return state
        .set('pending', false)
        .set('newUser', action.payload);
    case CREATE_USER_REJECTED:
      return state
        .set('pending', false)
        .set('error', action.payload);
    default:
      return state;
  }
}

export default usersNewPageReducer;
