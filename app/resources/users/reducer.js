/*
 *
 * resources/users reducer
 *
 */

import { fromJS } from 'immutable';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from 'utils/paginationUtils';

import { LOAD_USERS_SUCCESS, RESET_USERS, DELETE_USER_SUCCESS, CREATE_USER_SUCCESS } from './constants';

export const initialState = fromJS({
  nextPageNumber: 1,
  nextPageItemCount: 3,
  loaded: [],
});

function usersReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_USERS_SUCCESS: {
      const ids = action.payload.data.map((idea) => idea.id);
      const nextPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextPageItemCount = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .update('loaded', (users) => users.concat(ids))
        .set('nextPageNumber', nextPageNumber)
        .set('nextPageItemCount', nextPageItemCount);
    }
    case RESET_USERS:
      return initialState;
    case DELETE_USER_SUCCESS: {
      const userIndex = state.get('loaded').findIndex((id) => action.id === id);
      return state.deleteIn(['loaded', userIndex]);
    }
    case CREATE_USER_SUCCESS: {
      const { id } = action.payload.data;
      return state.update('loaded', (users) => users.concat(id));
    }
    default:
      return state;
  }
}

export default usersReducer;
