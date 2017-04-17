/*
 *
 * IdeasIndexPage actions
 *
 */

import {
  LOAD_IDEAS_REQUEST, IDEAS_LOADED, IDEAS_LOADING_ERROR, SET_SHOW_IDEA_WITH_INDEX_PAGE, RESET_IDEAS,
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

export function loadIdeas(initialLoad, nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_IDEAS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
    initialLoad,
  };
}

export function resetIdeas() {
  return {
    type: RESET_IDEAS,
  };
}

export function setShowIdeaWithIndexPage(payload) {
  return {
    type: SET_SHOW_IDEA_WITH_INDEX_PAGE,
    payload,
  };
}
