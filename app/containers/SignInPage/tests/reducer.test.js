
import { fromJS } from 'immutable';
import signInPageReducer from '../reducer';

describe('signInPageReducer', () => {
  it('returns the initial state', () => {
    const expectedForm = fromJS({ authRequestPending: false });
    expect(signInPageReducer(undefined, {})).toEqual(expectedForm);
  });
});
