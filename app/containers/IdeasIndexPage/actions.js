/*
 *
 * IdeasIndexPage actions
 *
 */

import {
  LOAD_IDEAS_REQUEST,
  IDEAS_LOADED,
  IDEAS_LOADING_ERROR,
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
