/*
 *
 * NotificationMenu reducer
 *
 */

import { fromJS } from 'immutable';
import { LOAD_NOTIFICATIONS_SUCCESS } from 'resources/notifications/constants';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

const initialState = fromJS({
  notifications: [],
  nextPageNumber: 1,
  nextPageItemCount: 25,
});

function notificationMenuReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_NOTIFICATIONS_SUCCESS: {
      const ids = action.payload.data.map((notification) => notification.id);
      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .update('notifications', (notifications) => (action.nextPageNumber === 1 ? fromJS(ids) : notifications.concat(ids)))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount);
    }
    default:
      return state;
  }
}

export default notificationMenuReducer;
