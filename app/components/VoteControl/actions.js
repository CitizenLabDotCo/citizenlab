import {
  IDEA_VOTE_REQUEST,
  IDEA_VOTE_SUCCESS,
  IDEA_VOTE_ERROR,
  CANCEL_IDEA_VOTE_REQUEST,
  CANCEL_IDEA_VOTE_SUCCESS,
  CANCEL_IDEA_VOTE_ERROR,
} from './constants';

export function ideaVoteRequest(ideaId, mode) {
  return {
    type: IDEA_VOTE_REQUEST,
    payload: {
      ideaId,
      mode,
    },
  };
}

export function ideaVoteSuccess(response) {
  return {
    type: IDEA_VOTE_SUCCESS,
    payload: { response },
  };
}

export function ideaVoteError(error) {
  return {
    type: IDEA_VOTE_ERROR,
    error,
  };
}

export function cancelIdeaVoteRequest(ideaId, voteId) {
  return {
    type: CANCEL_IDEA_VOTE_REQUEST,
    payload: {
      ideaId,
      voteId,
    },
  };
}

export function cancelIdeaVoteSuccess(response) {
  return {
    type: CANCEL_IDEA_VOTE_SUCCESS,
    payload: { response },
  };
}

export function cancelIdeaVoteError(error) {
  return {
    type: CANCEL_IDEA_VOTE_ERROR,
    error,
  };
}
