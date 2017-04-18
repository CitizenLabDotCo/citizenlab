/*
 *
 * IdeasShow actions
 *
 */

import {
  LOAD_IDEA_REQUEST,
  LOAD_IDEA_SUCCESS,
  LOAD_IDEA_ERROR, LOAD_IDEA_VOTES_REQUEST, VOTE_IDEA_ERROR, LOAD_IDEA_VOTES_SUCCESS,
  LOAD_IDEA_VOTES_ERROR, VOTE_IDEA_SUCCESS, VOTE_IDEA_REQUEST,
} from './constants';

export function loadIdea(payload) {
  return {
    type: LOAD_IDEA_REQUEST,
    payload,
  };
}

export function loadIdeaSuccess(payload) {
  return {
    type: LOAD_IDEA_SUCCESS,
    payload,
  };
}

export function loadIdeaError(payload) {
  return {
    type: LOAD_IDEA_ERROR,
    payload,
    error: true,
  };
}

export function loadVotes(ideaId) {
  return {
    type: LOAD_IDEA_VOTES_REQUEST,
    ideaId,
  };
}

export function votesLoaded(payload) {
  return {
    type: LOAD_IDEA_VOTES_SUCCESS,
    payload,
  };
}

export function loadVotesError(error) {
  return {
    type: LOAD_IDEA_VOTES_ERROR,
    error,
  };
}

export function voteIdea(ideaId, userId, which) {
  return {
    type: VOTE_IDEA_REQUEST,
    ideaId,
    userId,
    which,
  };
}

export function ideaVoted(payload) {
  return {
    type: VOTE_IDEA_SUCCESS,
    payload,
  };
}

export function voteIdeaError(error) {
  return {
    type: VOTE_IDEA_ERROR,
    error,
  };
}
