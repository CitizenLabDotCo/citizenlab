/*
 *
 * IdeasIndexPage reducer
 *
 */

import { fromJS } from 'immutable';

import {
  IDEAS_LOADED, LOAD_IDEAS_REQUEST, RESET_IDEAS, SET_SHOW_IDEA_WITH_INDEX_PAGE,
} from './constants';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from '../../utils/paginationUtils';

const initialState = fromJS({
  nextPageNumber: null,
  nextPageItemCount: null,
  ideas: [],
  loading: false,
  showIdeaWithIndexPage: false,
});

function ideasIndexPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEAS_REQUEST:
      return state
        .set('loading', true);
    case SET_SHOW_IDEA_WITH_INDEX_PAGE:
      return state
        .set('showIdeaWithIndexPage', action.payload);
    case IDEAS_LOADED: {
      const ids = action.payload.data.map((idea) => idea.id);

      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);

      return state
        .update('ideas', (ideas) => (action.initialLoad ? fromJS(ids) : ideas.concat(ids)))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount)
        .set('loading', false);
    }
    case RESET_IDEAS:
      return state
        .update('ideas', () => fromJS([]))
        .set('nextPageNumber', null)
        .set('nextPageItemCount', null);
    default:
      return state;
  }
}

export default ideasIndexPageReducer;
