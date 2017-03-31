import { createSelector } from 'reselect';

/**
 * Direct selector to the ideasShow state domain
 */
const selectIdeasShowDomain = () => (state) => state.get('ideasShow');

/**
 * Other specific selectors
 */


/**
 * Default selector used by IdeasShow
 */

const makeSelectIdeasShow = () => createSelector(
  selectIdeasShowDomain(),
  (substate) => substate.toJS()
);

export default makeSelectIdeasShow;
export {
  selectIdeasShowDomain,
};
