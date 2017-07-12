/*
 *
 * resources/users reducer
 *
 */

import { fromJS } from 'immutable';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import { LOAD_USERS_REQUEST, LOAD_USERS_SUCCESS, RESET_USERS, DELETE_USER_SUCCESS, CREATE_USER_SUCCESS } from './constants';

export const initialState = fromJS({
  currentPageNumber: 1,
  lastPageNumber: 1,
  pageCount: 5,
  loading: false,
  ids: [],
});

function usersReducer(state = initialState, action, actionPrefix = '') {
  switch (action.type) {
    case actionPrefix + LOAD_USERS_REQUEST: {
      return state.set('loading', true);
    }
    case actionPrefix + LOAD_USERS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const currentPageNumber = getPageNumberFromUrl(action.payload.links.self) || 1;
      const lastPageNumber = getPageNumberFromUrl(action.payload.links.last) || currentPageNumber;
      const pageCount = getPageItemCountFromUrl(action.payload.links.self) || state.get('pageCount');

      return state
        .set('ids', fromJS(ids))
        .set('loading', false)
        .set('currentPageNumber', currentPageNumber)
        .set('lastPageNumber', lastPageNumber)
        .set('pageCount', pageCount);
    }
    case actionPrefix + RESET_USERS:
      return initialState;
    case actionPrefix + DELETE_USER_SUCCESS: {
      const userIndex = state.get('ids').findIndex((id) => action.id === id);
      return state.deleteIn(['ids', userIndex]);
    }
    case actionPrefix + CREATE_USER_SUCCESS: {
      const { id } = action.payload.data;
      return state.update('ids', (users) => users.concat(id));
    }
    default:
      return state;
  }
}

export default usersReducer;
