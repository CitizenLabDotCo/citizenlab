/*
 *
 * IdeasIndexPage actions
 *
 */

import {
  LOAD_IDEAS_REQUEST, IDEAS_LOADED, IDEAS_LOADING_ERROR,
  SET_SHOW_IDEA_WITH_INDEX_PAGE,
  LOAD_TOPICS_REQUEST, LOAD_TOPICS_SUCCESS, LOAD_TOPICS_ERROR,
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

export function setShowIdeaWithIndexPage(payload) {
  return {
    type: SET_SHOW_IDEA_WITH_INDEX_PAGE,
    payload,
  };
}

export function loadTopicsRequest(nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_TOPICS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function loadTopicsSuccess(topics) {
  return {
    type: LOAD_TOPICS_SUCCESS,
    payload: topics,
  };
}

export function loadTopicsError(errorMessage) {
  return {
    type: LOAD_TOPICS_ERROR,
    payload: errorMessage,
  };
}
