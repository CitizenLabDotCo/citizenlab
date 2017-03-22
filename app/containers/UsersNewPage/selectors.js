import { createSelector } from 'reselect';

/**
 * Direct selector to the usersNewPage state domain
 */
const selectUsersNewPageDomain = () => (state) => state.get('usersNewPage');

/**
 * Other specific selectors
 */


/**
 * Default selector used by UsersNewPage
 */

const makeSelectUsersNewPage = () => createSelector(
  selectUsersNewPageDomain(),
  (substate) => substate.toJS()
);

export default makeSelectUsersNewPage;
export {
  selectUsersNewPageDomain,
};
