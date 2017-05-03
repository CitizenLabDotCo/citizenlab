/*
 *
 * UsersPage selectors
 *
 */

import { createSelector } from 'reselect';

const selectUsers = (state) => state.getIn(['resources', 'users']);
const selectUsersIds = (state) => state.getIn(['usersPage', 'users']);
const selectPrevPageNumber = (state) => state.getIn(['usersPage', 'prevPageNumber']);
const selectPrevPageItemCount = (state) => state.getIn(['usersPage', 'prevPageItemCount']);
const selectCurrentPageNumber = (state) => state.getIn(['usersPage', 'currentPageNumber']);
const selectCurrentPageItemCount = (state) => state.getIn(['usersPage', 'currentPageItemCount']);
const selectNextPageNumber = (state) => state.getIn(['usersPage', 'nextPageNumber']);
const selectNextPageItemCount = (state) => state.getIn(['usersPage', 'nextPageItemCount']);
const selectPageCount = (state) => state.getIn(['usersPage', 'pageCount']);
const selectLoadingUsers = (state) => state.getIn(['usersPage', 'loading']);
const selectLoadUsersError = (state) => state.getIn(['usersPage', 'loadingError']);

const makeSelectUsers = () => createSelector(
  selectUsersIds,
  selectUsers,
  (usersIds, users) => usersIds.map((id) => users.get(id))
);

const makeSelectPrevPageNumber = () => createSelector(
  selectPrevPageNumber,
  (prevPageNumber) => prevPageNumber
);

const makeSelectPrevPageItemCount = () => createSelector(
  selectPrevPageItemCount,
  (prevPageItemCount) => prevPageItemCount
);

const makeSelectCurrentPageNumber = () => createSelector(
  selectCurrentPageNumber,
  (currentPageNumber) => currentPageNumber
);

const makeSelectCurrentPageItemCount = () => createSelector(
  selectCurrentPageItemCount,
  (currentPageItemCount) => currentPageItemCount
);

const makeSelectNextPageNumber = () => createSelector(
  selectNextPageNumber,
  (nextPageNumber) => nextPageNumber
);

const makeSelectNextPageItemCount = () => createSelector(
  selectNextPageItemCount,
  (nextPageItemCount) => nextPageItemCount
);

const makeSelectPageCount = () => createSelector(
  selectPageCount,
  (pageCount) => pageCount
);

const makeSelectLoadingUsers = () => createSelector(
  selectLoadingUsers,
  (loading) => loading
);

const makeSelectLoadUsersError = () => createSelector(
  selectLoadUsersError,
  (loadingError) => loadingError
);

export {
  makeSelectUsers,
  makeSelectPrevPageNumber,
  makeSelectPrevPageItemCount,
  makeSelectCurrentPageNumber,
  makeSelectCurrentPageItemCount,
  makeSelectNextPageNumber,
  makeSelectNextPageItemCount,
  makeSelectPageCount,
  makeSelectLoadingUsers,
  makeSelectLoadUsersError,
};
