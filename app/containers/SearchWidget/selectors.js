/**
 * Direct selector to the search state domain
 */
import { createSelector } from 'reselect';
import { fromJS } from 'immutable';
import { selectResourcesDomain } from 'utils/resources/selectors';
import createFragment from 'react-addons-create-fragment';

import IdeasSearchResultWrapper from './IdeasSearchResultWrapper';
import IdeasSearchResult from './IdeasSearchResult';

const selectSearchDomain = () => (state) => state.get('searchWidget');
/**
 * Other specific selectors
 */

const makeSelectIsLoadingFilteredIdeas = () => createSelector(
  selectSearchDomain(),
  (searchWidgetState) => searchWidgetState.get('isLoadingFilteredIdeas')
);

const makeSelectSearchResults = () => createSelector(
  selectSearchDomain(),
  selectResourcesDomain(),
  (pageState, resources) => {
    const ids = pageState.get('searchResults', fromJS([]));
    const resourceIdeas = resources.get('ideas');
    return (resourceIdeas
      ? ids.map((id, index) => ({
        title: resourceIdeas.toJS()[id].attributes.title_multiloc,
        id: index,
        price: id,
        testProp: 'anyvalue',
        // each result will be rendered by Search wrapped in IdeasSearchResultWrapper
        as: IdeasSearchResultWrapper,
      }))
      : []);
  }
);

export {
  selectSearchDomain,
  makeSelectIsLoadingFilteredIdeas,
  makeSelectSearchResults,
};
