/*
 *
 * resources/events reducer
 *
 */

import { fromJS } from 'immutable';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import { LOAD_EVENTS_SUCCESS, RESET_EVENTS, DELETE_EVENT_SUCCESS, CREATE_EVENT_SUCCESS } from './constants';

export const initialState = fromJS({
  nextPageNumber: 1,
  nextPageItemCount: 3,
  loaded: [],
});

function eventsReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_EVENTS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .update('loaded', (events) => events.concat(ids))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount);
    }
    case RESET_EVENTS:
      return initialState;
    case DELETE_EVENT_SUCCESS: {
      const eventIndex = state.get('loaded').findIndex((id) => action.id === id);
      return state.deleteIn(['loaded', eventIndex]);
    }
    case CREATE_EVENT_SUCCESS: {
      const { id } = action.payload.data;
      return state.update('loaded', (events) => events.concat(id));
    }
    default:
      return state;
  }
}

export default eventsReducer;
