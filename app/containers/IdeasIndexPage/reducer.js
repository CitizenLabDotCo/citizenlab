/*
 *
 * IdeasIndexPage reducer
 *
 */

import { fromJS } from 'immutable';
import * as qs from 'qs';

import {
  IDEAS_LOADED, LOAD_IDEAS_REQUEST,
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

      return state
        .set('ideas', fromJS(state.get('ideas')).concat(ids))
        .set('nextPageNumber', getPageNumberFromUrl(action.payload.links.next))
        .set('nextPageItemCount', getPageItemCountFromUrl(action.payload.links.next))
        .set('loading', false);
    }
    default:
      return state;
  }
}

export default ideasIndexPageReducer;
