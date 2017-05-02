import { fromJS } from 'immutable';
import { generateResourcesIdeaValue } from 'utils/testing/mocks';

import searchWidgetReducer from '../reducer';
import { searchIdeasSuccess } from '../actions';

describe('searchWidgetReducer', () => {
  const initialState = {
    isLoadingFilteredIdeas: false,
    searchResults: null,
  };

  it('returns the initial state', () => {
    expect(searchWidgetReducer(undefined, {})).toEqual(fromJS(initialState));
  });

  describe('SEARCH_IDEAS_SUCCESS', () => {
    it('should return searchResults to the provided ids', () => {
      const initialStateWithIdeas = initialState;

      // ideas from resources
      const payload = {
        data: [],
        links: {},
      };

      let i = 0;
      while (i < 10) {
        payload.data.push(generateResourcesIdeaValue(i).data);

        i += 1;
      }

      const nextState = searchWidgetReducer(
        fromJS(initialStateWithIdeas), searchIdeasSuccess(payload)
      ).toJS();
      expect(nextState.searchResults.length).toEqual(10);
    });
  });
});
