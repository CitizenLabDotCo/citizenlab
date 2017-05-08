/*
 *
 * UsersPage reducer
 *
 */

import { fromJS } from 'immutable';
import _ from 'lodash';
import {
  LOAD_USERS_REQUEST, LOAD_USERS_SUCCESS, LOAD_USERS_ERROR,
} from './constants';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from '../../../utils/paginationUtils';

const initialState = fromJS({
  users: [],
  prevPageNumber: null,
  prevPageItemCount: null,
  currentPageNumber: null,
  currentPageItemCount: null,
  nextPageNumber: null,
  nextPageItemCount: null,
  pageCount: null,
  loading: false,
  loadingError: false,
});

function UsersPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_USERS_REQUEST:
      return state
        .set('loading', action.initialLoad)
        .set('loadingError', false);
    case LOAD_USERS_SUCCESS: {
      const ids = action.payload.users.data.map((user) => user.id);
      const prevPageNumber = getPageNumberFromUrl(action.payload.users.links.prev);
      const prevPageItemCount = getPageItemCountFromUrl(action.payload.users.links.prev);
      const currentPageNumber = getPageNumberFromUrl(action.payload.users.links.self);
      const currentPageItemCount = getPageItemCountFromUrl(action.payload.users.links.self);
      const nextPageNumber = getPageNumberFromUrl(action.payload.users.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.users.links.next);
      const lastPageNumber = getPageNumberFromUrl(action.payload.users.links.last);

      let pageCount = 1;
      if (_.isNumber(lastPageNumber)) {
        pageCount = lastPageNumber;
      } else if (_.isNumber(action.payload.pageCount)) {
        pageCount = action.payload.pageCount;
      }

      return state
        .set('users', fromJS(ids))
        .set('prevPageNumber', prevPageNumber)
        .set('prevPageItemCount', prevPageItemCount)
        .set('currentPageNumber', currentPageNumber)
        .set('currentPageItemCount', currentPageItemCount)
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount)
        .set('pageCount', pageCount)
        .set('loading', false)
        .set('loadingError', false);
    }
    case LOAD_USERS_ERROR:
      return state
        .set('loading', false)
        .set('loadingError', true);
    default:
      return state;
  }
}

export default UsersPageReducer;
