/*
 *
 * AdminPages reducer
 *
 */

import { fromJS } from 'immutable';
import _ from 'lodash';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import {
  LOAD_PAGES_REQUEST, LOAD_PAGES_SUCCESS, LOAD_PAGES_ERROR,
} from './constants';

const initialState = fromJS({
  pages: [],
  prevPageNumber: null,
  prevPageItemCount: null,
  currentPageNumber: null,
  currentPageItemCount: null,
  nextPageNumber: null,
  nextPageItemCount: null,
  pageCount: null,
  loading: false,
  loadError: false,
});

function adminPagesReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_PAGES_REQUEST:
      return state
        .set('loading', true)
        .set('loadError', false);
    case LOAD_PAGES_SUCCESS: {
      const ids = action.payload.pages.data.map((page) => page.id);
      const prevPageNumber = getPageNumberFromUrl(action.payload.pages.links.prev);
      const prevPageItemCount = getPageItemCountFromUrl(action.payload.pages.links.prev);
      const currentPageNumber = getPageNumberFromUrl(action.payload.pages.links.self);
      const currentPageItemCount = getPageItemCountFromUrl(action.payload.pages.links.self);
      const nextPageNumber = getPageNumberFromUrl(action.payload.pages.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.pages.links.next);
      const lastPageNumber = getPageNumberFromUrl(action.payload.pages.links.last);

      let pageCount = 1;
      if (_.isNumber(lastPageNumber)) {
        pageCount = lastPageNumber;
      } else if (_.isNumber(action.payload.pageCount)) {
        pageCount = action.payload.pageCount;
      }

      return state
        .set('pages', fromJS(ids))
        .set('prevPageNumber', prevPageNumber)
        .set('prevPageItemCount', prevPageItemCount)
        .set('currentPageNumber', currentPageNumber)
        .set('currentPageItemCount', currentPageItemCount)
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount)
        .set('pageCount', pageCount)
        .set('loading', false)
        .set('loadError', false);
    }
    case LOAD_PAGES_ERROR:
      return state
        .set('loading', false)
        .set('loadError', true);
    default:
      return state;
  }
}

export default adminPagesReducer;
