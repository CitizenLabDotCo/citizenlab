/*
 *
 * IdeasShow reducer
 *
 */

import { fromJS } from 'immutable';

import {
  LOAD_IDEA_VOTES_ERROR, LOAD_IDEA_VOTES_REQUEST, LOAD_IDEA_VOTES_SUCCESS, RESET_PAGE_DATA, LOAD_COMMENTS_REQUEST, LOAD_COMMENTS_ERROR, LOAD_COMMENTS_SUCCESS,
  LOAD_IDEA_SUCCESS, STORE_COMMENT_REQUEST, STORE_COMMENT_ERROR, SAVE_COMMENT_DRAFT,
  LOAD_IDEA_REQUEST, LOAD_IDEA_ERROR, VOTE_IDEA_ERROR, VOTE_IDEA_REQUEST, VOTE_IDEA_SUCCESS,
} from './constants';
import { getPageItemCountFromUrl, getPageNumberFromUrl } from '../../utils/paginationUtils';

const initialState = fromJS({
  loadingIdea: false,
  idea: null,
  votes: [],
  ideaVotesLoadError: null,
  loadingVotes: false,
  submittingVote: false,
  ideaVoteSubmitError: null,
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

export default function ideasShowReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_IDEA_REQUEST:
      return state
        .set('loadIdeaError', null)
        .set('loadingIdea', true);
    case LOAD_IDEA_SUCCESS:
      return state
        .set('loadingIdea', false)
        .set('idea', action.payload.data.id);
    case LOAD_IDEA_VOTES_REQUEST:
      return state
        .set('ideaVotesLoadError', null)
        .set('loadingVotes', true);
    case LOAD_IDEA_VOTES_SUCCESS: {
      const votesIds = action.payload.data.map((vote) => vote.id);

      return state
        .update('votes', (votes) => votes.concat(votesIds))
        .set('loadingVotes', false);
    }
    case LOAD_IDEA_VOTES_ERROR:
      return state
        .set('ideaVotesLoadError', action.error)
        .set('loadingVotes', false);
    case VOTE_IDEA_REQUEST:
      return state
        .set('ideaVoteSubmitError', null)
        .set('submittingVote', true);
    case VOTE_IDEA_SUCCESS: {
      return state
        .update('votes', (votes) => votes.concat(action.payload.data.id))
        .set('submittingVote', false);
    }
    case VOTE_IDEA_ERROR:
      return state
        .set('ideaVoteSubmitError', action.error)
        .set('submittingVote', false);
    case LOAD_IDEA_ERROR:
      return state
        .set('loadIdeaError', action.loadIdeaError)
        .set('loadingIdea', false);
    case LOAD_COMMENTS_REQUEST:
      return state
        .update('comments', (comments) => (action.initialLoad ? fromJS([]) : comments))
        .set('resetEditorContent', false)
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
        .set('resetEditorContent', true)
        .set('submittingComment', true);
    case STORE_COMMENT_ERROR:
      return state
        .set('resetEditorContent', false)
        .set('storeCommentError', action.storeCommentError)
        .set('submittingComment', false);
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
