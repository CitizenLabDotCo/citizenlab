import { fromJS } from 'immutable';
import { initialState } from '../reducer';

describe('usersNewPageReducer', () => {
  it('returns the initial state', () => {
    expect(initialState).toEqual(fromJS({
      pending: false,
      error: null,
      newUser: null,
    }));
  });
});
