/**
 * Direct selector to the search state domain
 */
import { createSelector } from 'reselect';
import { selectResourcesDomain } from 'utils/resources/selectors';

import IdeasSearchResultWrapper from './IdeasSearchResultWrapper';

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
    // console.log(pageState.toJS(), resources.toJS())
    const ids = pageState.get('searchResults');
    const resourceIdeas = resources.get('ideas');
    // console.log('-------------------------------------');
    // console.log(`resourceIdeas: `, resourceIdeas);
    // console.log(`ids (selector): `, ids);
    // console.log('return value (selector): ', (ids && resourceIdeas
    //   ? ids.map((id, index) => ({
    //     titleMultiloc: resourceIdeas.toJS()[id].attributes.title_multiloc,
    //     ideaId: id,
    //     key: index,
    //     // each result will be rendered by Search wrapped in IdeasSearchResultWrapper
    //     as: IdeasSearchResultWrapper,
    //   }))
    //   : []));
    return (ids && resourceIdeas
      ? ids.map((id, index) => ({
        titleMultiloc: resourceIdeas.toJS()[id].attributes.title_multiloc,
        ideaId: id,
        key: index,
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
