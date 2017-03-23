/*
 *
 * SignInPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  USER_LOGIN,
} from './constants';

const initialState = fromJS({});

function signInPageReducer(state = initialState, action) {
  switch (action.type) {
    case USER_LOGIN:
      console.log("[DEBUG] action =", action); // eslint-disable-line
      return state;
    default:
      return state;
  }
}

export default signInPageReducer;
