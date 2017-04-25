/*
 *
 * Search actions
 *
 */

import { SEARCH_IDEAS_REQUEST, SEARCH_IDEAS_ERROR, SEARCH_IDEAS_SUCCESS } from './constants';

export function searchIdeasRequest(filter) {
  return {
    type: SEARCH_IDEAS_REQUEST,
    payload: filter,
  };
}

export function searchIdeasSuccess(response) {
  return {
    type: SEARCH_IDEAS_SUCCESS,
    payload: response,
  };
}

export function searchIdeasError(error) {
  return {
    type: SEARCH_IDEAS_ERROR,
    payload: error,
  };
}
