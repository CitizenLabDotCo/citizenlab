import {
  SEARCH_TERM_CHANGED,
  SEARCH_TERM_STABILIZED,
  PAGE_SELECTION_CHANGED,
  SORT_COLUMN_CHANGED,
  INITIAL_LOAD,
  LOAD_USERS_XLSX_REQUEST,
  LOAD_USERS_XLSX_SUCCESS,
  LOAD_USERS_XLSX_ERROR,
} from './constants';

export function searchTermChanged(payload) {
  return {
    payload,
    type: SEARCH_TERM_CHANGED,
  };
}

export function searchTermStabilized(payload) {
  return {
    payload,
    type: SEARCH_TERM_STABILIZED,
    meta: {
      track: {
        name: 'Admin users searched',
        properties: {
          searchString: payload,
        },
      },
    },
  };
}

export function pageSelectionChanged(payload) {
  return {
    payload,
    type: PAGE_SELECTION_CHANGED,
    meta: {
      track: {
        name: 'Admin users pagination changed',
        properties: {
          page: payload,
        },
      },
    },
  };
}

export function sortColumnChanged(payload) {
  return {
    payload,
    type: SORT_COLUMN_CHANGED,
    meta: {
      track: {
        name: 'Admin users sort column changed',
        properties: {
          column: payload,
        },
      },
    },
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
    meta: {
      track: {
        name: 'Admin users download xlsx clicked',
      },
    },
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

