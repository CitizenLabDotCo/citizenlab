import { createSelector } from 'reselect';

/**
 * Direct selector to the usersPasswordRecovery state domain
 */
const selectUsersPasswordRecoveryDomain = () => (state) => state.get('usersPasswordRecovery');

/**
 * Other specific selectors
 */


/**
 * Default selector used by UsersPasswordRecovery
 */

const makeSelectUsersPasswordRecovery = () => createSelector(
  selectUsersPasswordRecoveryDomain(),
  (substate) => substate.toJS()
);

export default makeSelectUsersPasswordRecovery;
export {
  selectUsersPasswordRecoveryDomain,
};
