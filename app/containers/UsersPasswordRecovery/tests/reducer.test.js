
import { fromJS } from 'immutable';
import usersPasswordRecoveryReducer from '../reducer';

describe('usersPasswordRecoveryReducer', () => {
  it('returns the initial state', () => {
    expect(usersPasswordRecoveryReducer(undefined, {})).toEqual(fromJS({}));
  });
});
