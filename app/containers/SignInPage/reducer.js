/*
 *
 * SignInPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  AUTHENTICATE_SUCCESS,
} from './constants';

const initialState = fromJS({});

function signInPageReducer(state = initialState, action) {
  switch (action.type) {
    case AUTHENTICATE_SUCCESS:
      console.log("[DEBUG] action =", action); // eslint-disable-line
      return state;
    default:
      return state;
  }
}

export default signInPageReducer;
