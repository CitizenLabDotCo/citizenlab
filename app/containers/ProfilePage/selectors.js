import { createSelector } from 'reselect';

/**
 * Direct selector to the profilePage state domain
 */
const selectProfilePageDomain = () => (state) => state.get('profilePage');

/**
 * Other specific selectors
 */


/**
 * Default selector used by ProfilePage
 */

const makeSelectProfilePage = () => createSelector(
  selectProfilePageDomain(),
  (substate) => substate.toJS()
);

export default makeSelectProfilePage;
export {
  selectProfilePageDomain,
};
