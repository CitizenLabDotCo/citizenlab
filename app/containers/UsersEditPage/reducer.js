/*
 *
 * UsersEditPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  LOAD_CURRENT_USER_SUCCESS, UPDATE_CURRENT_USER_REQUEST, UPDATE_CURRENT_USER_SUCCESS,
  UPDATE_USER_LOCALE,
} from './constants';

export const usersEditPageInitialState = fromJS({
  stored: false,
  currentUser: fromJS({ }),
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
    case LOAD_CURRENT_USER_SUCCESS:
      return state
        .set('currentUser', currentUserWithId);
    case UPDATE_CURRENT_USER_REQUEST:
      return state
        .set('stored', false);
    case UPDATE_CURRENT_USER_SUCCESS:
      return state
        .set('stored', true);
    case UPDATE_USER_LOCALE:
      return state
        .set('currentUser', fromJS(state.get('currentUser')).set('locale', action.userLocale));
    default:
      return state;
  }
}
