/*
 *
 * IdeasShow actions
 *
 */

import {
  LOAD_IDEA_REQUEST, LOAD_IDEA_SUCCESS, LOAD_IDEA_ERROR, LOAD_IDEA_VOTES_REQUEST, VOTE_IDEA_ERROR, STORE_COMMENT_ERROR, STORE_COMMENT_REQUEST, SAVE_COMMENT_DRAFT, LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_SUCCESS, LOAD_COMMENTS_ERROR, RESET_PAGE_DATA, LOAD_IDEA_VOTES_SUCCESS,
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

export function ideaLoadError(loadIdeaError) {
  return {
    type: LOAD_IDEA_ERROR,
    loadIdeaError,
  };
}

export function saveCommentDraft(commentContent, activeParentId) {
  return {
    type: SAVE_COMMENT_DRAFT,
    commentContent,
    activeParentId,
  };
}

export function loadComments(ideaId, nextCommentPageNumber, nextCommentPageItemCount, initialLoad = true) {
  return {
    type: LOAD_COMMENTS_REQUEST,
    ideaId,
    nextCommentPageNumber,
    nextCommentPageItemCount,
    initialLoad,
  };
}

export function commentsLoaded(payload) {
  return {
    type: LOAD_COMMENTS_SUCCESS,
    payload,
  };
}

export function commentsLoadError(loadCommentsError) {
  return {
    type: LOAD_COMMENTS_ERROR,
    loadCommentsError,
  };
}

export function publishComment(ideaId, userId, htmlContents, parentId) {
  return {
    type: STORE_COMMENT_REQUEST,
    ideaId,
    userId,
    htmlContents,
    parentId,
  };
}

export function publishCommentError(storeCommentError) {
  return {
    type: STORE_COMMENT_ERROR,
    storeCommentError,
  };
}

export function resetPageData() {
  return {
    type: RESET_PAGE_DATA,
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

export function voteIdea(ideaId, mode) {
  return {
    type: VOTE_IDEA_REQUEST,
    ideaId,
    mode,
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
