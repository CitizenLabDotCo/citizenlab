
import { fromJS } from 'immutable';
import resetUserPasswordReducer from '../reducer';

describe('resetUserPasswordReducer', () => {
  it('returns the initial state', () => {
    expect(resetUserPasswordReducer(undefined, {})).toEqual(fromJS({}));
  });
});
