import { createSelector } from 'reselect';

/**
 * Direct selector to the usersShowPage state domain
 */
const selectUsersShowPageDomain = () => (state) => state.get('usersShowPage');

/**
 * Other specific selectors
 */


/**
 * Default selector used by UsersShowPage
 */

const makeSelectUsersShowPage = () => createSelector(
  selectUsersShowPageDomain(),
  (substate) => substate.toJS()
);

export default makeSelectUsersShowPage;
export {
  selectUsersShowPageDomain,
};
