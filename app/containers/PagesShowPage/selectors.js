import { createSelector } from 'reselect';

/**
 * Direct selector to the pagesShowPage state domain
 */
const selectPagesShowPageDomain = () => (state) => state.get('pagesShowPage');

/**
 * Other specific selectors
 */


/**
 * Default selector used by PagesShowPage
 */

const makeSelectPagesShowPage = () => createSelector(
  selectPagesShowPageDomain(),
  (substate) => substate.toJS()
);

export default makeSelectPagesShowPage;
export {
  selectPagesShowPageDomain,
};
