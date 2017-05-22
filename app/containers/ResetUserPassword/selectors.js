import { createSelector } from 'reselect';

/**
 * Direct selector to the resetUserPassword state domain
 */
const selectResetUserPasswordDomain = () => (state) => state.get('resetUserPassword');

/**
 * Other specific selectors
 */


/**
 * Default selector used by ResetUserPassword
 */

const makeSelectResetUserPassword = () => createSelector(
  selectResetUserPasswordDomain(),
  (substate) => substate.toJS()
);

export default makeSelectResetUserPassword;
export {
  selectResetUserPasswordDomain,
};
