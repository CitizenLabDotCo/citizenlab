/*
 *
 * UsersPasswordRecovery reducer
 *
 */

import { fromJS } from 'immutable';

import { SEND_RECOVERY_LINK_ERROR, SEND_RECOVERY_LINK_REQUEST, SEND_RECOVERY_LINK_SUCCESS } from './constants';


const initialState = fromJS({
  processing: false,
  notFoundError: false,
  sent: false,
});

function usersPasswordRecoveryReducer(state = initialState, action) {
  switch (action.type) {
    case SEND_RECOVERY_LINK_REQUEST:
      return state
        .set('notFoundError', false)
        .set('sent', false)
        .set('processing', true);
    case SEND_RECOVERY_LINK_SUCCESS:
      return state
        .set('sent', true)
        .set('processing', false);
    case SEND_RECOVERY_LINK_ERROR:
      return state
        .set('notFoundError', true)
        .set('processing', false);
    default:
      return state;
  }
}

export default usersPasswordRecoveryReducer;
