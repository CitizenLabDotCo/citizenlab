/*
 *
 * resources/users reducer
 *
 */

import { fromJS } from 'immutable';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import { LOAD_USERS_SUCCESS, RESET_USERS, DELETE_USER_SUCCESS, CREATE_USER_SUCCESS } from './constants';

export const initialState = fromJS({
  currentPageNumber: 1,
  lastPageNumber: 1,
  pageCount: 5,
  ids: [],
});

function usersReducer(state = initialState, action, actionPrefix = '') {
  switch (action.type) {
    case actionPrefix + LOAD_USERS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const currentPageNumber = getPageNumberFromUrl(action.payload.links.self);
      const lastPageNumber = getPageNumberFromUrl(action.payload.links.last) || currentPageNumber;
      const pageCount = getPageItemCountFromUrl(action.payload.links.self);

      return state
        .set('ids', fromJS(ids))
        .set('currentPageNumber', currentPageNumber)
        .set('lastPageNumber', lastPageNumber)
        .set('pageCount', pageCount);
        // .update('ids', (users) => users.concat(ids))
    }
    case actionPrefix + RESET_USERS:
      return initialState;
    case actionPrefix + DELETE_USER_SUCCESS: {
      const userIndex = state.get('users').findIndex((id) => action.id === id);
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

export function makePrefixedUsersReducer(actionPrefix) {
  return (state, action) => usersReducer(state, action, actionPrefix);
}

export default usersReducer;
