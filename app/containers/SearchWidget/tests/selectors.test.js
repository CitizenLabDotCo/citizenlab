import { fromJS } from 'immutable';
import { generateResourcesIdeaValue } from 'utils/testing/mocks';

import { generateSearchResult, makeSelectSearchResults } from '../selectors';

describe('SearchWidget selectors', () => {
  describe('makeSelectSearchResults', () => {
    it('should select the current search results', () => {
      const searchResultsSelector = makeSelectSearchResults();

      const state = {
        // page name nested for proper conversion by fromJS
        searchWidget: {
          searchResults: [],
        },
        resources: {
          ideas: [],
        },
      };

      const searchResults = [];

      let i = 0;
      while (i < 5) {
        state.searchWidget.searchResults.push(i);
        state.resources.ideas[i] = generateResourcesIdeaValue(i).data;
        searchResults.push(generateSearchResult(fromJS(state.resources.ideas), i, i));

        i += 1;
      }
      expect(searchResultsSelector(fromJS(state)).toJS()).toEqual(searchResults);
    });
  });
});
