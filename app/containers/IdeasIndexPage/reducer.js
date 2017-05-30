/*
 *
 * IdeasIndexPage reducer
 *
 */

import { fromJS } from 'immutable';

import { LOAD_IDEAS_SUCCESS, RESET_IDEAS, LOAD_TOPICS_SUCCESS, LOAD_AREAS_SUCCESS } from './constants';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from '../../utils/paginationUtils';

const initialState = fromJS({
  nextPageNumber: null,
  nextPageItemCount: null,
  ideas: [],
  topics: {},
  areas: {},
});

function ideasIndexPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEAS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);

      return state
        .update('ideas', (ideas) => (action.initialLoad ? fromJS(ids) : ideas.concat(ids)))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount);
    }
    case RESET_IDEAS: {
      const taEmpty = {};
      return state
        .update('ideas', () => fromJS([]))
        .update('topics', () => fromJS(taEmpty))
        .update('areas', () => fromJS(taEmpty))
        .set('nextPageNumber', null)
        .set('nextPageItemCount', null);
    }
    case LOAD_TOPICS_SUCCESS: {
      const ids = action.payload.data.map((topic) => topic.id);
      const nextPageNumber = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .setIn(['topics', 'ids'], fromJS(ids))
        .setIn(['topics', 'nextPageNumber'], nextPageNumber);
    }
    case LOAD_AREAS_SUCCESS: {
      const ids = action.payload.data.map((area) => area.id);
      const nextPageNumber = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .setIn(['areas', 'ids'], fromJS(ids))
        .setIn(['areas', 'nextPageNumber'], nextPageNumber);
    }
    default:
      return state;
  }
}

export default ideasIndexPageReducer;
