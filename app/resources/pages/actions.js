/*
 *
 * resources/pages actions
 *
 */

import {
  LOAD_PAGES_ERROR, LOAD_PAGES_REQUEST, LOAD_PAGES_SUCCESS, RESET_PAGES, LOAD_PAGE_REQUEST, LOAD_PAGE_SUCCESS, LOAD_PAGE_ERROR, DELETE_PAGE_REQUEST, DELETE_PAGE_SUCCESS, DELETE_PAGE_ERROR, CREATE_PAGE_SUCCESS } from './constants';

export function loadPagesRequest(nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_PAGES_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function loadPagesSuccess(response) {
  return {
    type: LOAD_PAGES_SUCCESS,
    payload: response,
  };
}

export function loadPagesError(error) {
  return {
    type: LOAD_PAGES_ERROR,
    error,
  };
}

export function loadPageRequest(id) {
  return {
    type: LOAD_PAGE_REQUEST,
    id,
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

export function createPageSuccess(response) {
  return {
    type: CREATE_PAGE_SUCCESS,
    payload: response,
  };
}

export function deletePageRequest(id) {
  return {
    type: DELETE_PAGE_REQUEST,
    id,
  };
}

export function deletePageSuccess(id) {
  return {
    type: DELETE_PAGE_SUCCESS,
    id,
  };
}

export function deletePageError(error) {
  return {
    type: DELETE_PAGE_ERROR,
    error,
  };
}

export function resetPages() {
  return {
    type: RESET_PAGES,
  };
}
