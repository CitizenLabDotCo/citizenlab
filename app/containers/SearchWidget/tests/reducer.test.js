
import { fromJS } from 'immutable';
import searchWidgetReducer from '../reducer';

describe('searchWidgetReducer', () => {
  const initialState = {
    isLoadingFilteredIdeas: false,
  };

  it('returns the initial state', () => {
    expect(searchWidgetReducer(undefined, {})).toEqual(fromJS(initialState));
  });
});
