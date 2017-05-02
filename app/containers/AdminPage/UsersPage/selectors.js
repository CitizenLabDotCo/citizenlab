/*
 *
 * UsersPage selectors
 *
 */

import { createSelector } from 'reselect';
import { fromJS } from 'immutable';
import { selectResourcesDomain } from 'utils/resources/selectors';

const selectUsersPage = (state) => state.get('usersPage');

const makeSelectUsers = () => createSelector(
  selectUsersPage,
  selectResourcesDomain(),
  (pageState, resources) => {
    const ids = pageState.get('users', fromJS([]));
    const usersMap = resources.get('users', fromJS({}));
    return (ids && ids.size > 0 ? ids.map((id) => usersMap.get(id)).toJS() : null);
  }
);

const makeSelectPrevPageNumber = () => createSelector(
  selectUsersPage,
  (pageState) => pageState.get('prevPageNumber')
);

const makeSelectPrevPageItemCount = () => createSelector(
  selectUsersPage,
  (pageState) => pageState.get('prevPageItemCount')
);

const makeSelectCurrentPageNumber = () => createSelector(
  selectUsersPage,
  (pageState) => pageState.get('currentPageNumber')
);

const makeSelectCurrentPageItemCount = () => createSelector(
  selectUsersPage,
  (pageState) => pageState.get('currentPageItemCount')
);

const makeSelectNextPageNumber = () => createSelector(
  selectUsersPage,
  (pageState) => pageState.get('nextPageNumber')
);

const makeSelectNextPageItemCount = () => createSelector(
  selectUsersPage,
  (pageState) => pageState.get('nextPageItemCount')
);

/*
const makeSelectLastPageNumber = () => createSelector(
  selectUsersPage,
  (pageState) => pageState.get('nextPageNumber')
);

const makeSelectLastPageItemCount = () => createSelector(
  selectUsersPage,
  (pageState) => pageState.get('nextPageItemCount')
);
*/

const makeSelectPageCount = () => createSelector(
  selectUsersPage,
  (pageState) => pageState.get('pageCount')
);

const makeSelectLoadingUsers = () => createSelector(
  selectUsersPage,
  (pageState) => pageState.get('loading')
);

const makeSelectLoadUsersError = () => createSelector(
  selectUsersPage,
  (pageState) => pageState.get('loadingError')
);

export {
  makeSelectUsers,
  makeSelectPrevPageNumber,
  makeSelectPrevPageItemCount,
  makeSelectCurrentPageNumber,
  makeSelectCurrentPageItemCount,
  makeSelectNextPageNumber,
  makeSelectNextPageItemCount,
  // makeSelectLastPageNumber,
  // makeSelectLastPageItemCount,
  makeSelectPageCount,
  makeSelectLoadingUsers,
  makeSelectLoadUsersError,
};
