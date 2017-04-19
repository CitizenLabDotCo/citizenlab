
import { fromJS } from 'immutable';
import ideasShowReducer from '../reducer';
import { generateResourcesVoteValue } from './__shared';
import { resetVotes, votesLoaded } from '../actions';

describe('ideasShowReducer', () => {
  const expectedInitialState = {
    idea: null,
    votes: [],
    ideaVotesLoadError: null,
    loadingVotes: false,
    submittingVote: false,
    ideaVoteSubmitError: null,
  };

  it('returns the initial state', () => {
    expect(ideasShowReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });

  describe('LOAD_IDEA_VOTES_SUCCESS', () => {
    it('returns existing votes with new votes', () => {
      const initialStateWithUpVotes = expectedInitialState;
      let i = 0;

      // comments from resources
      const payload = {
        data: [],
      };

      while (i < 20) {
        if (i < 10) {
          initialStateWithUpVotes.votes.push(i);
        }
        payload.data.push(generateResourcesVoteValue(i, false, false));

        i += 1;
      }

      const nextState = ideasShowReducer(
        fromJS(initialStateWithUpVotes), votesLoaded(payload)
      ).toJS();
      expect(nextState.votes.length).toEqual(i + 10);
    });
  });

  describe('RESET_votes', () => {
    it('returns empty votes array', () => {
      const nextState = ideasShowReducer(
        fromJS(expectedInitialState), resetVotes()
      ).toJS();
      expect(nextState.votes.length).toEqual(0);
    });
  });
});
