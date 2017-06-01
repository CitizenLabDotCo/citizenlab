import { fromJS } from 'immutable';
import _ from 'lodash';
import {
  LOAD_USERS_REQUEST, LOAD_USERS_SUCCESS, LOAD_USERS_ERROR,
} from './constants';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from '../../../utils/paginationUtils';

const initialState = fromJS({
  users: [],
  firstPageNumber: null,
  firstPageItemCount: null,
  prevPageNumber: null,
  prevPageItemCount: null,
  currentPageNumber: null,
  currentPageItemCount: null,
  nextPageNumber: null,
  nextPageItemCount: null,
  lastPageNumber: null,
  lastPageItemCount: null,
  pageCount: null,
  loadingUsers: false,
  loadUsersError: false,
});

function UsersPageReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_USERS_REQUEST:
      return state
        .set('loadingUsers', action.initialLoad)
        .set('loadUsersError', false);
    case LOAD_USERS_SUCCESS: {
      const ids = action.payload.users.data.map((user) => user.id);
      const firstPageNumber = getPageNumberFromUrl(action.payload.users.links.first);
      const firstPageItemCount = getPageItemCountFromUrl(action.payload.users.links.first);
      const prevPageNumber = getPageNumberFromUrl(action.payload.users.links.prev);
      const prevPageItemCount = getPageItemCountFromUrl(action.payload.users.links.prev);
      const currentPageNumber = getPageNumberFromUrl(action.payload.users.links.self);
      const currentPageItemCount = getPageItemCountFromUrl(action.payload.users.links.self);
      const nextPageNumber = getPageNumberFromUrl(action.payload.users.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.users.links.next);
      const lastPageNumber = getPageNumberFromUrl(action.payload.users.links.last);
      const lastPageItemCount = getPageItemCountFromUrl(action.payload.users.links.last);

      let pageCount = 1;
      if (_.isNumber(lastPageNumber)) {
        pageCount = lastPageNumber;
      } else if (_.isNumber(action.payload.pageCount)) {
        pageCount = action.payload.pageCount;
      }

      return state
        .set('users', fromJS(ids))
        .set('firstPageNumber', firstPageNumber)
        .set('firstPageItemCount', firstPageItemCount)
        .set('prevPageNumber', prevPageNumber)
        .set('prevPageItemCount', prevPageItemCount)
        .set('currentPageNumber', currentPageNumber)
        .set('currentPageItemCount', currentPageItemCount)
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount)
        .set('lastPageNumber', lastPageNumber)
        .set('lastPageItemCount', lastPageItemCount)
        .set('pageCount', pageCount)
        .set('loadingUsers', false)
        .set('loadUsersError', false);
    }
    case LOAD_USERS_ERROR:
      return state
        .set('loadingUsers', false)
        .set('loadUsersError', true);
    default:
      return state;
  }
}

export default UsersPageReducer;
