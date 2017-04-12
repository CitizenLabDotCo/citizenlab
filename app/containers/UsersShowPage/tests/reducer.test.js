
import { fromJS } from 'immutable';
import usersShowPageReducer from '../reducer';

describe('usersShowPageReducer', () => {
  const expectedInitialState = {
    userData: {},
    loading: false,
    loadError: null,
  };

  it('returns the initial state', () => {
    expect(usersShowPageReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });
});
