/*
 *
 * resources/topics actions
 *
 */

import {
  LOAD_TOPICS_ERROR, LOAD_TOPICS_REQUEST, LOAD_TOPICS_SUCCESS, RESET_TOPICS,
} from './constants';

export function loadTopicsRequest(initialLoad, nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_TOPICS_REQUEST,
    initialLoad,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function loadTopicsSuccess(response) {
  return {
    type: LOAD_TOPICS_SUCCESS,
    payload: response,
  };
}

export function loadTopicsError(error) {
  return {
    type: LOAD_TOPICS_ERROR,
    error,
  };
}

export function resetTopics() {
  return {
    type: RESET_TOPICS,
  };
}
