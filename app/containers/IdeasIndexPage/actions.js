/*
 *
 * IdeasIndexPage actions
 *
 */

import {
  LOAD_IDEAS_REQUEST, IDEAS_LOADED, IDEAS_LOADING_ERROR, IDEAS_RESET,
  SET_SHOW_IDEA_WITH_INDEX_PAGE,
} from './constants';

export function ideasLoaded(ideas) {
  return {
    type: IDEAS_LOADED,
    payload: ideas,
  };
}

export function ideasLoadingError(errorMessage) {
  return {
    type: IDEAS_LOADING_ERROR,
    payload: errorMessage,
  };
}

export function loadIdeas(nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_IDEAS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function resetIdeas() {
  return {
    type: IDEAS_RESET,
  };
}

export function setShowIdeaWithIndexPage(payload) {
  return {
    type: SET_SHOW_IDEA_WITH_INDEX_PAGE,
    payload,
  };
}
