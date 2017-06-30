/*
 *
 * IdeasShow actions
 *
 */

import {
  LOAD_IDEA_REQUEST, LOAD_IDEA_SUCCESS, LOAD_IDEA_ERROR, LOAD_VOTES_REQUEST, VOTE_IDEA_ERROR, PUBLISH_COMMENT_ERROR, PUBLISH_COMMENT_REQUEST, SAVE_COMMENT_DRAFT, LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_SUCCESS, LOAD_COMMENTS_ERROR, RESET_PAGE_DATA, LOAD_VOTES_SUCCESS,
LOAD_VOTES_ERROR, VOTE_IDEA_SUCCESS, VOTE_IDEA_REQUEST, DELETE_COMMENT_REQUEST, DELETE_COMMENT_SUCCESS, DELETE_COMMENT_ERROR, PUBLISH_COMMENT_SUCCESS,
} from './constants';

export function loadIdeaRequest(payload) {
  return {
    type: LOAD_IDEA_REQUEST,
    payload,
  };
}

export function loadIdeaSuccess(payload) {
  return {
    type: LOAD_IDEA_SUCCESS,
    payload,
    meta: {
      tracking: {
        message: 'Idea loaded!',
        attributes: {
          ideaId: payload.data.id,
        },
      },
    },
  };
}

export function loadIdeaError(error) {
  return {
    type: LOAD_IDEA_ERROR,
    error,
  };
}

export function saveCommentDraft(commentContent, activeParentId) {
  return {
    type: SAVE_COMMENT_DRAFT,
    commentContent,
    activeParentId,
  };
}

export function loadCommentsRequest(ideaId, nextCommentPageNumber, nextCommentPageItemCount, initialLoad = true) {
  return {
    type: LOAD_COMMENTS_REQUEST,
    ideaId,
    nextCommentPageNumber,
    nextCommentPageItemCount,
    initialLoad,
  };
}

export function loadCommentsSuccess(payload) {
  return {
    type: LOAD_COMMENTS_SUCCESS,
    payload,
  };
}

export function loadCommentsError(error) {
  return {
    type: LOAD_COMMENTS_ERROR,
    error,
  };
}

export function publishCommentRequest(ideaId, userId, htmlContents, parentId) {
  return {
    type: PUBLISH_COMMENT_REQUEST,
    ideaId,
    userId,
    htmlContents,
    parentId,
  };
}

export function publishCommentSuccess(payload) {
  return {
    type: PUBLISH_COMMENT_SUCCESS,
    payload,
  };
}

export function publishCommentError(error) {
  return {
    type: PUBLISH_COMMENT_ERROR,
    error,
  };
}

export function deleteCommentRequest(commentId) {
  return {
    type: DELETE_COMMENT_REQUEST,
    commentId,
  };
}

export function deleteCommentSuccess(commentId) {
  return {
    type: DELETE_COMMENT_SUCCESS,
    commentId,
  };
}

export function deleteCommentError(commentId) {
  return {
    type: DELETE_COMMENT_ERROR,
    commentId,
  };
}

export function resetPageData() {
  return {
    type: RESET_PAGE_DATA,
  };
}

export function loadVotesRequest(ideaId) {
  return {
    type: LOAD_VOTES_REQUEST,
    ideaId,
  };
}

export function loadVotesSuccess(payload) {
  return {
    type: LOAD_VOTES_SUCCESS,
    payload,
  };
}

export function loadVotesError(error) {
  return {
    type: LOAD_VOTES_ERROR,
    error,
  };
}

export function voteIdeaRequest(ideaId, mode) {
  return {
    type: VOTE_IDEA_REQUEST,
    ideaId,
    mode,
  };
}

export function voteIdeaSuccess(payload) {
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
