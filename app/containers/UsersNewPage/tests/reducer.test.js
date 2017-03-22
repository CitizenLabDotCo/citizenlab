
import { fromJS } from 'immutable';
import usersNewPageReducer from '../reducer';

describe('usersNewPageReducer', () => {
  it('returns the initial state', () => {
    expect(usersNewPageReducer(undefined, {})).toEqual(fromJS({}));
  });
});
