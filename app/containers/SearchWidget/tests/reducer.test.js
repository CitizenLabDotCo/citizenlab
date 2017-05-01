
import { fromJS } from 'immutable';
import searchWidgetReducer from '../reducer';

describe('searchWidgetReducer', () => {
  const initialState = {
    isLoadingFilteredIdeas: false,
    searchResults: null,
  };

  it('returns the initial state', () => {
    expect(searchWidgetReducer(undefined, {})).toEqual(fromJS(initialState));
  });
});
