/*
 *
 * IdeasShow actions
 *
 */

import {
  LOAD_IDEA_REQUEST, LOAD_IDEA_SUCCESS, LOAD_IDEA_ERROR, STORE_COMMENT_ERROR, STORE_COMMENT_SUCCESS,
  STORE_COMMENT_REQUEST, SAVE_COMMENT_DRAFT, LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_SUCCESS, LOAD_COMMENTS_ERROR,
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

export function saveCommentDraft(commentContent) {
  return {
    type: SAVE_COMMENT_DRAFT,
    commentContent,
  };
}

export function loadComments(ideaId) {
  return {
    type: LOAD_COMMENTS_REQUEST,
    ideaId,
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

export function commentPublished(comment) {
  return {
    type: STORE_COMMENT_SUCCESS,
    comment,
  };
}

export function publishCommentError(storeCommentError) {
  return {
    type: STORE_COMMENT_ERROR,
    storeCommentError,
  };
}
