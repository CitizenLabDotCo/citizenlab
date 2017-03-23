
import { fromJS } from 'immutable';
import signInPageReducer from '../reducer';

describe('signInPageReducer', () => {
  it('returns the initial state', () => {
    expect(signInPageReducer(undefined, {})).toEqual(fromJS({}));
  });
});
