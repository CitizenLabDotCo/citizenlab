
import { fromJS } from 'immutable';
import profilePageReducer from '../reducer';

describe('profilePageReducer', () => {
  it('returns the initial state', () => {
    expect(profilePageReducer(undefined, {})).toEqual(fromJS({}));
  });
});
