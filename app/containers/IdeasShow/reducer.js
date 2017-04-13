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

const initialState = fromJS({
  idea: null,
  commentContent: null,
  storeCommentError: null,
  loadCommentsError: null,
  loadingComments: false,
  submittingComment: false,
  comments: [],
});

function ideasShowReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEA_SUCCESS:
      return state
        .set('idea', action.payload);
    case LOAD_COMMENTS_REQUEST:
      return state
        .set('loadCommentsError', null)
        .set('loadingComments', true);
    case LOAD_COMMENTS_SUCCESS:
      return state
        .set('comments', action.payload.data)
        .set('loadingComments', false);
    case LOAD_COMMENTS_ERROR:
      return state
        .set('loadCommentsError', action.loadCommentsError)
        .set('loadingComments', false);
    case SAVE_COMMENT_DRAFT:
      return state
        .set('commentContent', action.commentContent);
    case STORE_COMMENT_REQUEST:
      return state
        .set('storeCommentError', null)
        .set('submittingComment', true);
    case STORE_COMMENT_SUCCESS:
      // TODO: refactor to use only ids and make the map from the store (like IdeasIndexPage)
      return state
        .update('comments', (comments) => comments.concat(action.comment))
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
