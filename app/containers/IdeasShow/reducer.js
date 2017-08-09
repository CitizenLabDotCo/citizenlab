/*
 *
 * IdeasShow reducer
 *
 */

import { fromJS } from 'immutable';

import {
  LOAD_VOTES_SUCCESS, RESET_PAGE_DATA, LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_SUCCESS,
  LOAD_IDEA_SUCCESS, VOTE_IDEA_SUCCESS, PUBLISH_COMMENT_REQUEST, PUBLISH_COMMENT_SUCCESS, PUBLISH_COMMENT_ERROR, DELETE_COMMENT_SUCCESS,
} from './constants';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from '../../utils/paginationUtils';

const initialState = fromJS({
  idea: null,
  votes: [],
  comments: [],
  images: [],
  nextCommentPageNumber: null,
  nextCommentPageItemCount: null,
  newComment: {},
});

export default function ideasShowReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEA_SUCCESS:
      return state
        .set('images', fromJS(action.payload.data.relationships.idea_images.data.map((image) => image.id)))
        .set('idea', action.payload.data.id);
    case LOAD_VOTES_SUCCESS: {
      const votesIds = action.payload.data.map((vote) => vote.id);
      return state
        .update('votes', (votes) => votes.concat(votesIds));
    }
    case VOTE_IDEA_SUCCESS: {
      return state
        .update('votes', (votes) => votes.concat(action.payload.data.id));
    }
    case LOAD_COMMENTS_REQUEST:
      return state
        .update('comments', (comments) => (action.initialLoad ? fromJS([]) : comments));
    case LOAD_COMMENTS_SUCCESS: {
      const ids = action.payload.data.map((comment) => comment.id);
      const nextCommentPageNumber = getPageNumberFromUrl(action.payload.links.next);
      const nextCommentPageItemCount = getPageItemCountFromUrl(action.payload.links.next);
      return state
        .update('comments', (comments) => comments.concat(ids))
        .set('nextCommentPageNumber', nextCommentPageNumber)
        .set('nextCommentPageItemCount', nextCommentPageItemCount);
    }
    case PUBLISH_COMMENT_REQUEST: {
      return state
        .setIn(['newComment', action.payload.parent_id || 'root'], fromJS({
          formStatus: 'processing',
          error: null,
        }));
    }
    case PUBLISH_COMMENT_SUCCESS: {
      return state
        .setIn(['newComment', action.parentId || 'root'], fromJS({
          formStatus: 'success',
          error: null,
        }));
    }
    case PUBLISH_COMMENT_ERROR: {
      return state
        .setIn(['newComment', action.parentId || 'root'], fromJS({
          formStatus: 'error',
          error: action.error,
        }));
    }
    case DELETE_COMMENT_SUCCESS: {
      const commentIndex = state.get('comments').findIndex((id) => action.commentId === id);
      return state.deleteIn(['comments', commentIndex]);
    }
    case RESET_PAGE_DATA:
      return initialState;
    default:
      return state;
  }
}
