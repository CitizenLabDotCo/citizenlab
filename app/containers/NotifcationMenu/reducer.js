/*
 *
 * NotificationMenu reducer
 *
 */

import { fromJS } from 'immutable';

const initialState = fromJS({
  notifications: [],
  nextPageNumber: 1,
  nextPageItemCount: 25,
});

function notificationMenuReducer(state = initialState, action) {
  switch (action.type) {
    case DEFAULT_ACTION:
      return state;
    default:
      return state;
  }
}

export default notificationMenuReducer;
