
import { fromJS } from 'immutable';
import usersShowPageReducer from '../reducer';

describe('usersShowPageReducer', () => {
  const expectedInitialState = {
    user: null,
    ideas: [],
    loadingUser: false,
    loadingUserIdeas: false,
    loadUserError: null,
    loadUserIdeasError: null,
  };

  it('returns the initial state', () => {
    expect(usersShowPageReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });
});
