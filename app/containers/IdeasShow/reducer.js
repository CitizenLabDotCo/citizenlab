/*
 *
 * IdeasShow reducer
 *
 */

import { fromJS } from 'immutable';

import {
  LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_ERROR, LOAD_COMMENTS_SUCCESS,
  LOAD_IDEA_SUCCESS, STORE_COMMENT_REQUEST, STORE_COMMENT_ERROR, STORE_COMMENT_SUCCESS, SAVE_COMMENT_DRAFT,
} from './constants';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from '../IdeasIndexPage/reducer';

const initialState = fromJS({
  idea: null,
  commentContent: null,
  storeCommentError: null,
  loadCommentsError: null,
  loadingComments: false,
  submittingComment: false,
  comments: [],
  resetEditorContent: false,
  nextCommentPageNumber: null,
  nextCommentPageItemCount: null,
});

function ideasShowReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEA_SUCCESS:
      return state
        .set('idea', action.payload);
    case LOAD_COMMENTS_REQUEST:
      return state
        .set('editorInitialContent', null)
        .set('loadCommentsError', null)
        .set('loadingComments', true);
    case LOAD_COMMENTS_SUCCESS: {
      const ids = action.payload.data.map((comment) => comment.id);

      const nextCommentPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextCommentPageItemCount = getPageItemCountFromUrl(action.payload.links.next);

      return state
        .set('comments', fromJS(ids))
        .set('nextPageNumber', nextCommentPageNumber)
        .set('nextPageItemCount', nextCommentPageItemCount)
        .set('loadingComments', false);
    }
    case LOAD_COMMENTS_ERROR:
      return state
        .set('loadCommentsError', action.loadCommentsError)
        .set('loadingComments', false);
    case SAVE_COMMENT_DRAFT:
      return state
        .set('commentContent', action.commentContent)
        .set('resetEditorContent', false);
    case STORE_COMMENT_REQUEST:
      return state
        .set('storeCommentError', null)
        .set('submittingComment', true);
    case STORE_COMMENT_SUCCESS:
      return state
        .update('comments', (comments) => comments.concat(action.comment))
        .set('resetEditorContent', true)
        .set('submittingComment', false);
    case STORE_COMMENT_ERROR:
      return state
        .set('storeCommentError', action.storeCommentError)
        .set('submittingComment', false);
    default:
      return state;
  }
}

export default ideasShowReducer;
