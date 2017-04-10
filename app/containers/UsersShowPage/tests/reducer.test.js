
import { fromJS } from 'immutable';
import usersShowPageReducer from '../reducer';

describe('usersShowPageReducer', () => {
  it('returns the initial state', () => {
    expect(usersShowPageReducer(undefined, {})).toEqual(fromJS({}));
  });
});
