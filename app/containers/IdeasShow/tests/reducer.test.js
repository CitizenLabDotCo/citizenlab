
import { fromJS } from 'immutable';
import ideasShowReducer from '../reducer';

describe('ideasShowReducer', () => {
  const expectedInitialState = {
    idea: null,
    upVotes: [],
    downVotes: [],
    ideaVotesLoadError: null,
  };

  it('returns the initial state', () => {
    expect(ideasShowReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });
});
