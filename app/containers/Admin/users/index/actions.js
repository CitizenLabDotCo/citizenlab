import { SEARCH_TERM_CHANGED, PAGE_SELECTION_CHANGED, SORT_COLUMN_CHANGED, INITIAL_LOAD } from './constants';

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

