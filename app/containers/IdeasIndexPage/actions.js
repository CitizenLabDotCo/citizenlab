/*
 *
 * IdeasIndexPage actions
 *
 */

import {
  LOAD_IDEAS_REQUEST, IDEAS_LOADED, IDEAS_LOADING_ERROR, SET_SHOW_IDEA_WITH_INDEX_PAGE, RESET_IDEAS, LOAD_TOPICS_REQUEST, LOAD_TOPICS_SUCCESS, LOAD_TOPICS_ERROR, LOAD_AREAS_REQUEST, LOAD_AREAS_SUCCESS, LOAD_AREAS_ERROR,
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

export function loadIdeas(initialLoad, nextPageNumber, nextPageItemCount, filters) {
  return {
    type: LOAD_IDEAS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
    filters,
    initialLoad,
  };
}

export function loadNextPage(nextPageNumber, nextPageItemCount, filters = {}) {
  return loadIdeas(false, nextPageNumber, nextPageItemCount, filters);
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

export function loadAreasRequest(nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_AREAS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function loadAreasSuccess(areas) {
  return {
    type: LOAD_AREAS_SUCCESS,
    payload: areas,
  };
}

export function loadAreasError(errorMessage) {
  return {
    type: LOAD_AREAS_ERROR,
    payload: errorMessage,
  };
}

export function initIdeasData() {
  return (dispatch) => {
    dispatch(loadIdeas(true));
    dispatch(loadTopicsRequest());
    dispatch(loadAreasRequest());
  };
}



// to implement ?
// reloadIdeas: (filters) => {
//   dispatch(loadIdeas({ filters }));
// }
