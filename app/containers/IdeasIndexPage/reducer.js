/*
 *
 * IdeasIndexPage reducer
 *
 */

import { fromJS } from 'immutable';
import * as qs from 'qs';

import {
  IDEAS_LOADED, IDEAS_RESET, LOAD_IDEAS_REQUEST,
  SET_SHOW_IDEA_WITH_INDEX_PAGE,
} from './constants';

const initialState = fromJS({
  nextPageNumber: null,
  nextPageItemCount: null,
  ideas: [],
  loading: false,
  showIdeaWithIndexPage: false,
});

export function getPageNumberFromUrl(url) {
  if (!url) return null;
  const queryString = url.split('?')[1];
  const result = qs.parse(queryString).page.number;
  return (result < 0 ? null : parseInt(result, 10));
}

export function getPageItemCountFromUrl(url) {
  if (!url) return null;
  const queryString = url.split('?')[1];
  const result = qs.parse(queryString).page.size;
  return (result < 0 ? null : parseInt(result, 10));
}

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
        // concatenate if not first loading
        .update('ideas', (ideas) => (action.resetIdeas ? fromJS(ids) : ideas.concat(ids)))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount)
        .set('loading', false);
    }
    case IDEAS_RESET:
      return state
        .set('ideas', fromJS([]))
        .set('nextPageNumber', null)
        .set('nextPageItemCount', null);
    default:
      return state;
  }
}

export default ideasIndexPageReducer;
