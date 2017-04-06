/*
 *
 * IdeasIndexPage reducer
 *
 */

import { fromJS } from 'immutable';
import * as qs from 'qs';

import {
  IDEAS_LOADED, IDEAS_RESET, LOAD_IDEAS_REQUEST,
} from './constants';

const initialState = fromJS({
  nextPageNumber: null,
  nextPageItemCount: null,
  ideas: [],
  loading: false,
});

export function getPageNumberFromUrl(url) {
  if (!url) return null;
  const result = qs.parse(new URL(url).search.substr(1)).page.number;
  return (result < 0 ? null : parseInt(result, 10));
}

export function getPageItemCountFromUrl(url) {
  if (!url) return null;
  const result = qs.parse(new URL(url).search.substr(1)).page.size;
  return (result < 0 ? null : parseInt(result, 10));
}

function ideasIndexPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEAS_REQUEST:
      return state
        .set('loading', true);
    case IDEAS_LOADED: {
      const ids = action.payload.data.map((idea) => idea.id);

      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);

      return state
        .update('ideas', (ideas) => ideas.concat(ids))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount)
        .set('loading', false);
    }
    case IDEAS_RESET:
      return state
        .set('nextPageNumber', null)
        .set('nextPageItemCount', null)
        .set('ideas', []);
    default:
      return state;
  }
}

export default ideasIndexPageReducer;
