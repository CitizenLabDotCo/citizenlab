/*
 *
 * IdeasShow reducer
 *
 */

import { fromJS } from 'immutable';
import {
  LOAD_IDEA_SUCCESS, LOAD_IDEA_VOTES_ERROR, LOAD_IDEA_VOTES_REQUEST, LOAD_IDEA_VOTES_SUCCESS, VOTE_IDEA_ERROR,
  VOTE_IDEA_REQUEST, VOTE_IDEA_SUCCESS,
} from './constants';

const initialState = fromJS({
  idea: null,
  upVotes: [],
  downVotes: [],
  ideaVotesLoadError: null,
  loadingVotes: false,
  submittingVote: false,
  ideaVoteSubmitError: null,
});

function ideasShowReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEA_SUCCESS:
      return state
        .set('idea', action.payload);
    case LOAD_IDEA_VOTES_REQUEST:
      return state
        .set('ideaVotesLoadError', null)
        .set('loadingVotes', true);
    case LOAD_IDEA_VOTES_SUCCESS: {
      const upVoteId = action.payload.data.map((vote) => vote.up.id);
      const downVoteId = action.payload.data.map((vote) => vote.down.id);
      const targetVoteProperty = (upVoteId ? 'upVoteId' : 'downVoteId');

      return state
        .update(targetVoteProperty, (upVotes) => upVotes.concat(upVoteId || downVoteId))
        .set('loadingVotes', false);
    }
    case LOAD_IDEA_VOTES_ERROR:
      return state
        .set('ideaVotesLoadError', action.error)
        .set('loadingVotes', false);
    case VOTE_IDEA_REQUEST:
      return state
        .set('ideaVoteSubmitError', null)
        .set('submittingVote', true);
    case VOTE_IDEA_SUCCESS:
      return state
        .set('submittingVote', false);
    case VOTE_IDEA_ERROR:
      return state
        .set('ideaVoteSubmitError', action.error)
        .set('submittingVote', false);
    default:
      return state;
  }
}

export default ideasShowReducer;
