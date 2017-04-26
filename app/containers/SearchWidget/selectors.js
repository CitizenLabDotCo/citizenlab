import { createSelector } from 'reselect';

/**
 * Direct selector to the search state domain
 */
const selectSearchDomain = () => (state) => state.get('searchWidget');

/**
 * Other specific selectors
 */

const makeSelectIsLoadingFilteredIdeas = () => createSelector(
  selectSearchDomain(),
  (searchWidgetState) => searchWidgetState.get('isLoadingFilteredIdeas')
);

export {
  selectSearchDomain,
  makeSelectIsLoadingFilteredIdeas,
};
