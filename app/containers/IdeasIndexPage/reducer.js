/*
 *
 * IdeasIndexPage reducer
 *
 */

import { fromJS } from 'immutable';
import * as qs from 'qs';

import {
  IDEAS_LOADED, LOAD_IDEAS_REQUEST, SET_SHOW_IDEA_WITH_INDEX_PAGE,
  LOAD_TOPICS_REQUEST, LOAD_TOPICS_SUCCESS,
  LOAD_AREAS_REQUEST, LOAD_AREAS_SUCCESS,
} from './constants';

const initialState = fromJS({
  nextPageNumber: null,
  nextPageItemCount: null,
  ideas: [],
  loading: false,
  showIdeaWithIndexPage: false,
  topics: {
    ids: [],
    nextPageNumber: null,
    loading: false,
  },
  areas: {
    ids: [],
    nextPageNumber: null,
    loading: false,
  },
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
        .set('ideas', fromJS(ids))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount)
        .set('loading', false);
    }
    case LOAD_TOPICS_REQUEST:
      return state.setIn(['topics', 'loading'], true);
    case LOAD_TOPICS_SUCCESS: {
      const ids = action.payload.data.map((topic) => topic.id);
      const nextPageNumber = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .setIn(['topics', 'ids'], fromJS(ids))
        .setIn(['topics', 'nextPageNumber'], nextPageNumber)
        .setIn(['topics', 'loading'], false);
    }
    case LOAD_AREAS_REQUEST:
      return state.setIn(['areas', 'loading'], true);
    case LOAD_AREAS_SUCCESS: {
      const ids = action.payload.data.map((area) => area.id);
      const nextPageNumber = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .setIn(['areas', 'ids'], fromJS(ids))
        .setIn(['areas', 'nextPageNumber'], nextPageNumber)
        .setIn(['areas', 'loading'], false);
    }
    default:
      return state;
  }
}

export default ideasIndexPageReducer;
