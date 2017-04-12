/*
 *
 * UsersShowPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  LOAD_USER_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_ERROR,
} from './constants';

const initialState = fromJS({
  userData: {},
  loading: false,
  loadError: null,
});

function usersShowPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_USER_REQUEST:
      return state
        .set('loading', true)
        .set('loadError', null);
    case LOAD_USER_SUCCESS:
      return state
        .set('loading', false)
        .set('userData', action.payload.data.attributes);
    case LOAD_USER_ERROR:
      return state
        .set('loading', false)
        .set('loadError', action.error);
    default:
      return state;
  }
}

export default usersShowPageReducer;
