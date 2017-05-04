/*
 *
 * UsersPage actions
 *
 */

import {
  LOAD_USERS_REQUEST, LOAD_USERS_SUCCESS, LOAD_USERS_ERROR,
} from './constants';

export function loadUsers(nextPageNumber, nextPageItemCount, pageCount, initialLoad) {
  return {
    type: LOAD_USERS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
    pageCount,
    initialLoad,
  };
}

export function usersLoaded(users, pageCount, initialLoad) {
  return {
    type: LOAD_USERS_SUCCESS,
    payload: { users, pageCount, initialLoad },
  };
}

export function usersLoadError(error) {
  return {
    type: LOAD_USERS_ERROR,
    payload: error,
  };
}
