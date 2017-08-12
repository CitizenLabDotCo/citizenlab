/*
 *
 * IdeasShow actions
 *
 */

import {
  LOAD_IDEA_REQUEST, LOAD_IDEA_SUCCESS, LOAD_IDEA_ERROR, PUBLISH_COMMENT_ERROR, PUBLISH_COMMENT_REQUEST, SAVE_COMMENT_DRAFT, LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_SUCCESS, LOAD_COMMENTS_ERROR, RESET_PAGE_DATA,
  DELETE_COMMENT_REQUEST, DELETE_COMMENT_SUCCESS, DELETE_COMMENT_ERROR, PUBLISH_COMMENT_SUCCESS,
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

export function publishCommentRequest(ideaId, comment) {
  return {
    type: PUBLISH_COMMENT_REQUEST,
    ideaId,
    payload: comment,
  };
}

export function publishCommentSuccess(payload, parentId) {
  return {
    type: PUBLISH_COMMENT_SUCCESS,
    payload,
    parentId,
    meta: {
      track: {
        name: 'Comment created',
        properties: {
          comment: payload.data,
        },
      },
    },
  };
}

export function publishCommentError(error, parentId) {
  return {
    type: PUBLISH_COMMENT_ERROR,
    error,
    parentId,
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
