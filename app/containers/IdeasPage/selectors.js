import { createSelector } from 'reselect';

/**
 * Direct selector to the ideasPage state domain
 */
const selectIdeasPageDomain = () => (state) => state.get('ideasPage');

/**
 * Other specific selectors
 */


/**
 * Default selector used by IdeasPage
 */

const makeSelectIdeasPage = () => createSelector(
  selectIdeasPageDomain(),
  (substate) => substate.toJS()
);

export default makeSelectIdeasPage;
export {
  selectIdeasPageDomain,
};
