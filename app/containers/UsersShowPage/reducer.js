/*
 *
 * UsersShowPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  LOAD_USER_REQUEST, LOAD_USER_SUCCESS, LOAD_USER_ERROR, LOAD_USER_IDEAS_REQUEST, LOAD_USER_IDEAS_SUCCESS, LOAD_USER_IDEAS_ERROR,
} from './constants';

const initialState = fromJS({
  user: null,
  ideas: [],
  loadingUser: false,
  loadingUserIdeas: false,
  loadUserError: null,
  loadUserIdeasError: null,
});

function usersShowPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_USER_REQUEST:
      return state
        .set('loadingUser', true)
        .set('loadUserError', null);
    case LOAD_USER_SUCCESS:
      return state
        .set('loadingUser', false)
        .set('user', action.payload.data.id);
    case LOAD_USER_ERROR:
      return state
        .set('loadingUser', false)
        .set('loadUserError', action.error);
    case LOAD_USER_IDEAS_REQUEST:
      return state
        .set('loadingUserIdeas', true)
        .set('loadUserIdeasError', null);
    case LOAD_USER_IDEAS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);

      return state
        .set('loadingUserIdeas', false)
        .set('ideas', fromJS(ids));
    }
    case LOAD_USER_IDEAS_ERROR:
      return state
        .set('loadingUserIdeas', false)
        .set('loadUserIdeasError', action.error);
    default:
      return state;
  }
}

export default usersShowPageReducer;
