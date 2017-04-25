
import { fromJS } from 'immutable';
import searchReducer from '../reducer';

describe('searchReducer', () => {
  const initialState = {
    isLoadingFilteredIdeas: false,
  };

  it('returns the initial state', () => {
    expect(searchReducer(undefined, {})).toEqual(fromJS(initialState));
  });
});
