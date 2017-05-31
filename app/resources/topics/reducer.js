/*
 *
 * resources/topics reducer
 *
 */

import { fromJS } from 'immutable';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import { LOAD_TOPICS_SUCCESS, RESET_TOPICS } from './constants';

export const initialState = fromJS({
  nextPageNumber: null,
  nextPageItemCount: null,
  topics: [],
});

function topicsReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_TOPICS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .update('topics', (areas) => areas.concat(ids))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount);
    }
    case RESET_TOPICS:
      return state
        .set('topics', fromJS([]));
    default:
      return state;
  }
}

export default topicsReducer;
