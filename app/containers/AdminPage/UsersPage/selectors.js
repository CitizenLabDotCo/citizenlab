import { createSelector } from 'reselect';

const selectUsers = (state) => state.getIn(['resources', 'users']);
const selectUsersIds = (state) => state.getIn(['usersPage', 'users']);
const selectFirstPageNumber = (state) => state.getIn(['usersPage', 'firstPageNumber']);
const selectFirstPageItemCount = (state) => state.getIn(['usersPage', 'firstPageItemCount']);
const selectPrevPageNumber = (state) => state.getIn(['usersPage', 'prevPageNumber']);
const selectPrevPageItemCount = (state) => state.getIn(['usersPage', 'prevPageItemCount']);
const selectCurrentPageNumber = (state) => state.getIn(['usersPage', 'currentPageNumber']);
const selectCurrentPageItemCount = (state) => state.getIn(['usersPage', 'currentPageItemCount']);
const selectNextPageNumber = (state) => state.getIn(['usersPage', 'nextPageNumber']);
const selectNextPageItemCount = (state) => state.getIn(['usersPage', 'nextPageItemCount']);
const selectLastPageNumber = (state) => state.getIn(['usersPage', 'lastPageNumber']);
const selectLastPageItemCount = (state) => state.getIn(['usersPage', 'lastPageItemCount']);
const selectPageCount = (state) => state.getIn(['usersPage', 'pageCount']);
const selectLoadingUsers = (state) => state.getIn(['usersPage', 'loadingUsers']);
const selectLoadUsersError = (state) => state.getIn(['usersPage', 'loadUsersError']);

const makeSelectUsers = () => createSelector(
  selectUsersIds,
  selectUsers,
  (usersIds, users) => usersIds.map((id) => users.get(id))
);

export {
  selectFirstPageNumber,
  selectFirstPageItemCount,
  selectPrevPageNumber,
  selectPrevPageItemCount,
  selectCurrentPageNumber,
  selectCurrentPageItemCount,
  selectNextPageNumber,
  selectNextPageItemCount,
  selectLastPageNumber,
  selectLastPageItemCount,
  selectPageCount,
  selectLoadingUsers,
  selectLoadUsersError,
  makeSelectUsers,
};
