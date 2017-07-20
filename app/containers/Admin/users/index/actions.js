import {
  SEARCH_TERM_CHANGED,
  PAGE_SELECTION_CHANGED,
  SORT_COLUMN_CHANGED,
  INITIAL_LOAD,
  LOAD_USERS_XLSX_REQUEST,
  LOAD_USERS_XLSX_SUCCESS,
  LOAD_USERS_XLSX_ERROR,
} from './constants';

export function searchTermChanged(payload) {
  return {
    type: SEARCH_TERM_CHANGED,
    payload,
  };
}

export function pageSelectionChanged(payload) {
  return {
    type: PAGE_SELECTION_CHANGED,
    payload,
  };
}

export function sortColumnChanged(payload) {
  return {
    type: SORT_COLUMN_CHANGED,
    payload,
  };
}

export function initialLoad() {
  return {
    type: INITIAL_LOAD,
  };
}

export function loadUsersXlsxRequest() {
  return {
    type: LOAD_USERS_XLSX_REQUEST,
  };
}

export function loadUsersXlsxSuccess() {
  return {
    type: LOAD_USERS_XLSX_SUCCESS,
  };
}

export function loadUsersXlsxError(error) {
  return {
    type: LOAD_USERS_XLSX_ERROR,
    payload: error,
  };
}

