/*
 *
 * PagesShowPage actions
 *
 */

import {
  LOAD_PAGE_REQUEST, LOAD_PAGE_SUCCESS, LOAD_PAGE_ERROR,
} from './constants';

export function loadPageRequest(pageId) {
  return {
    type: LOAD_PAGE_REQUEST,
    payload: pageId,
  };
}

export function loadPageSuccess(response) {
  return {
    type: LOAD_PAGE_SUCCESS,
    payload: response,
  };
}

export function loadPageError(error) {
  return {
    type: LOAD_PAGE_ERROR,
    error,
  };
}
