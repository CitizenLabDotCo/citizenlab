/*
 *
 * IdeasShow actions
 *
 */

import {
  LOAD_IDEA_REQUEST, LOAD_IDEA_SUCCESS, LOAD_IDEA_ERROR, STORE_COMMENT_ERROR, STORE_COMMENT_REQUEST, SAVE_COMMENT_DRAFT, LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_SUCCESS, LOAD_COMMENTS_ERROR, RESET_IDEA_AND_COMMENTS,
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
    error: true,
  };
}

export function saveCommentDraft(commentContent, activeParentId) {
  return {
    type: SAVE_COMMENT_DRAFT,
    commentContent,
    activeParentId,
  };
}

export function loadComments(ideaId, nextCommentPageNumber, nextCommentPageItemCount, initialLoad) {
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

export function publishCommentError(storeCommentError, storeCommentErrorId) {
  return {
    type: STORE_COMMENT_ERROR,
    storeCommentError,
    storeCommentErrorId,
  };
}

export function resetIdeaAndComments() {
  return {
    type: RESET_IDEA_AND_COMMENTS,
  };
}
