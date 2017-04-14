/*
 *
 * IdeasShow reducer
 *
 */

import { fromJS } from 'immutable';

import {
  LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_ERROR, LOAD_COMMENTS_SUCCESS,
  LOAD_IDEA_SUCCESS, STORE_COMMENT_REQUEST, STORE_COMMENT_ERROR, SAVE_COMMENT_DRAFT,
  LOAD_IDEA_REQUEST, LOAD_IDEA_ERROR, RESET_IDEA_AND_COMMENTS,
} from './constants';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from '../../utils/paginationUtils';

const initialState = fromJS({
  loadingIdea: false,
  idea: null,
  commentContent: null,
  loadIdeaError: null,
  storeCommentError: null,
  loadCommentsError: null,
  loadingComments: false,
  submittingComment: false,
  comments: [],
  resetEditorContent: false,
  nextCommentPageNumber: null,
  nextCommentPageItemCount: null,
  activeParentId: null,
});

function ideasShowReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEA_REQUEST:
      return state
        .set('loadIdeaError', null)
        .set('loadingIdea', true);
    case LOAD_IDEA_SUCCESS:
      return state
        .set('idea', action.payload)
        .set('loadingIdea', false);
    case LOAD_IDEA_ERROR:
      return state
        .set('loadIdeaError', action.loadIdeaError)
        .set('loadingIdea', false);
    case LOAD_COMMENTS_REQUEST:
      return state
        .update('comments', (comments) => (action.initialLoad ? fromJS([]) : comments))
        .set('commentContent', null)
        .set('loadCommentsError', null)
        .set('loadingComments', true);
    case LOAD_COMMENTS_SUCCESS: {
      const ids = action.payload.data.map((comment) => comment.id);

      const nextCommentPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextCommentPageItemCount = getPageItemCountFromUrl(action.payload.links.next);

      return state
        .set('submittingComment', false)
        .update('comments', (comments) => comments.concat(ids))
        .set('nextCommentPageNumber', nextCommentPageNumber)
        .set('nextCommentPageItemCount', nextCommentPageItemCount)
        .set('loadingComments', false);
    }
    case LOAD_COMMENTS_ERROR:
      return state
        .set('loadCommentsError', action.loadCommentsError)
        .set('loadingComments', false);
    case SAVE_COMMENT_DRAFT:
      return state
        .set('activeParentId', action.activeParentId)
        .set('commentContent', action.commentContent);
    case STORE_COMMENT_REQUEST:
      return state
        .set('storeCommentError', null)
        .set('submittingComment', true);
    case STORE_COMMENT_ERROR:
      return state
        .set('storeCommentError', action.storeCommentError)
        .set('submittingComment', false);
    case RESET_IDEA_AND_COMMENTS:
      return state
        .set('idea', null)
        .set('resetEditorContent', false)
        .update('comments', () => fromJS([]));
    default:
      return state;
  }
}

export default ideasShowReducer;
