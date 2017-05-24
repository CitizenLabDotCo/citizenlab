/*
 *
 * IdeasShow reducer
 *
 */

import { fromJS } from 'immutable';

import {
  LOAD_VOTES_SUCCESS, RESET_PAGE_DATA, LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_SUCCESS,
  LOAD_IDEA_SUCCESS, VOTE_IDEA_SUCCESS, PUBLISH_COMMENT_SUCCESS, DELETE_COMMENT_SUCCESS,
} from './constants';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from '../../utils/paginationUtils';

const initialState = fromJS({
  loadingIdea: false,
  idea: null,
  votes: [],
  ideaVotesLoadError: null,
  submittingVote: false,
  ideaVoteSubmitError: null,
  commentContent: null,
  storeCommentError: null,
  submittingComment: false,
  comments: [],
  nextCommentPageNumber: null,
  nextCommentPageItemCount: null,
  activeParentId: null,
});

export default function ideasShowReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEA_SUCCESS:
      return state
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
    case PUBLISH_COMMENT_SUCCESS: {
      const id = action.payload.id;
      return state
        .update('comments', (comments) => comments.concat(id));
    }
    case DELETE_COMMENT_SUCCESS: {
      const commentIndex = state.get('comments').findIndex((id) => action.commentId === id);
      return state.deleteIn(['comments', commentIndex]);
    }
    case RESET_PAGE_DATA:
      return state
        .set('idea', null)
        .set('resetEditorContent', false)
        .update('votes', () => fromJS([]))
        .update('comments', () => fromJS([]));
    default:
      return state;
  }
}

    // case SAVE_COMMENT_DRAFT:
    //   return state
    //     .set('activeParentId', action.activeParentId)
    //     .set('commentContent', action.commentContent);
