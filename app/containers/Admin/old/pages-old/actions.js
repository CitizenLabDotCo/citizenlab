/*
 *
 * AdminPages actions
 *
 */

import {
  LOAD_PAGES_REQUEST, LOAD_PAGES_SUCCESS, LOAD_PAGES_ERROR,
} from './constants';

export function loadPagesRequest(nextPageNumber, nextPageItemCount, pageCount) {
  return {
    type: LOAD_PAGES_REQUEST,
    nextPageNumber,
    nextPageItemCount,
    pageCount,
  };
}

export function loadPagesSuccess(pages, pageCount) {
  return {
    type: LOAD_PAGES_SUCCESS,
    payload: {
      pages,
      pageCount,
    },
  };
}

export function loadPagesError(error) {
  return {
    type: LOAD_PAGES_ERROR,
    payload: error,
  };
}
