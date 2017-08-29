/*
 *
 * resources/pages reducer
 *
 */

import { fromJS } from 'immutable';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import { LOAD_PAGES_SUCCESS, RESET_PAGES, DELETE_PAGE_SUCCESS, CREATE_PAGE_SUCCESS } from './constants';

export const initialState = fromJS({
  nextPageNumber: 1,
  nextPageItemCount: 3,
  loaded: [],
});

function pagesReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_PAGES_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .update('loaded', (pages) => pages.concat(ids))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount);
    }
    case RESET_PAGES:
      return initialState;
    case DELETE_PAGE_SUCCESS: {
      const pageIndex = state.get('loaded').findIndex((id) => action.id === id);
      return state.deleteIn(['loaded', pageIndex]);
    }
    case CREATE_PAGE_SUCCESS: {
      const { id } = action.payload.data;
      return state.update('loaded', (pages) => pages.concat(id));
    }
    default:
      return state;
  }
}

export default pagesReducer;
