/*
 *
 * ResetUserPassword reducer
 *
 */

import { fromJS } from 'immutable';
import { RESET_PASSWORD_ERROR, RESET_PASSWORD_REQUEST, RESET_PASSWORD_SUCCESS } from './constants';


const initialState = fromJS({
  processing: false,
  error: false,
  sent: false,
});

function resetUserPasswordReducer(state = initialState, action) {
  switch (action.type) {
    case RESET_PASSWORD_REQUEST:
      return state
        .set('error', false)
        .set('sent', false)
        .set('processing', true);
    case RESET_PASSWORD_SUCCESS:
      return state
        .set('sent', true)
        .set('processing', false);
    case RESET_PASSWORD_ERROR:
      return state
        .set('error', true)
        .set('processing', false);
    default:
      return state;
  }
}

export default resetUserPasswordReducer;
