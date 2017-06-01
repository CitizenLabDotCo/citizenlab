/*
 *
 * resources/topics reducer
 *
 */

import { fromJS } from 'immutable';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import { LOAD_TOPICS_SUCCESS, RESET_TOPICS, DELETE_TOPIC_SUCCESS, CREATE_TOPIC_SUCCESS } from './constants';

export const initialState = fromJS({
  nextPageNumber: 1,
  nextPageItemCount: 3,
  loaded: [],
});

function topicsReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_TOPICS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .update('loaded', (topics) => topics.concat(ids))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount);
    }
    case RESET_TOPICS:
      return initialState;
    case DELETE_TOPIC_SUCCESS: {
      const topicIndex = state.get('loaded').findIndex((id) => action.id === id);
      return state.deleteIn(['loaded', topicIndex]);
    }
    case CREATE_TOPIC_SUCCESS: {
      const { id } = action.payload.data;
      return state.update('loaded', (topics) => topics.concat(id));
    }
    default:
      return state;
  }
}

export default topicsReducer;
