/*
 *
 * UsersShowPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  LOAD_USER_SUCCESS, LOAD_USER_IDEAS_SUCCESS,
} from './constants';

const initialState = fromJS({
  user: null,
  ideas: [],
});

function usersShowPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_USER_SUCCESS:
      return state
        .set('user', action.payload.data.id);
    case LOAD_USER_IDEAS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);

      return state
        .set('ideas', fromJS(ids));
    }
    default:
      return state;
  }
}

export default usersShowPageReducer;
