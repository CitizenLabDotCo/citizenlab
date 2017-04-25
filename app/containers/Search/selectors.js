import { createSelector } from 'reselect';

/**
 * Direct selector to the search state domain
 */
const selectSearchDomain = () => (state) => state.get('search');

/**
 * Other specific selectors
 */

const makeSelectIsLoadingFilteredIdeas = () => createSelector(
  selectSearchDomain(),
  (appState) => appState.get('isLoadingFilteredIdeas')
);

export {
  selectSearchDomain,
  makeSelectIsLoadingFilteredIdeas,
};
