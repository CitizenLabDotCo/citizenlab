/*
 *
 * AdminPages actions
 *
 */

import {
  LOAD_PAGES_REQUEST, LOAD_PAGES_SUCCESS, LOAD_PAGES_ERROR,
} from './constants';

export function loadPagesRequest(nextPageNumber, nextPageItemCount, pageCount, initialLoad) {
  return {
    type: LOAD_PAGES_REQUEST,
    nextPageNumber,
    nextPageItemCount,
    pageCount,
    initialLoad,
  };
}

export function loadPagesSuccess(pages, pageCount, initialLoad) {
  return {
    type: LOAD_PAGES_SUCCESS,
    payload: {
      pages,
      pageCount,
      initialLoad,
    },
  };
}

export function loadPagesError(error) {
  return {
    type: LOAD_PAGES_ERROR,
    payload: error,
  };
}
