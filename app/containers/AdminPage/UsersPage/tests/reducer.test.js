
import { fromJS } from 'immutable';
import adminPageReducer from '../reducer';

describe('adminPageReducer', () => {
  it('returns the initial state', () => {
    const expectedInitialState = {
      users: [],
      loading: false,
      loadingError: false,
    };

    expect(adminPageReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });
});
