import { fromJS } from 'immutable';
import { expectPropertyNotNull } from 'utils/testing/methods';
import { stringMock } from 'utils/testing/constants';

import ideasShowReducer from '../reducer';
import { generateResourcesVoteValue, generateResourcesCommentValue } from './__shared';
import { commentsLoaded, ideaLoadError, loadComments, resetPageData, votesLoaded } from '../actions';

describe('ideasShowReducer', () => {
  const initialState = {
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
  };

  it('returns the initial state', () => {
    expect(ideasShowReducer(undefined, {})).toEqual(fromJS(initialState));
  });

  describe('LOAD_IDEA_ERROR', () => {
    it('returns loadIdeaError not null if error is provided', () => {
      const nextState = ideasShowReducer(
        fromJS(initialState), ideaLoadError(stringMock)
      ).toJS();
      expectPropertyNotNull(nextState, 'loadIdeaError');
    });
  });

  describe('LOAD_COMMENTS_REQUEST', () => {
    it('returns empty comment array if initialLoad is true', () => {
      const nextState = ideasShowReducer(
        fromJS(initialState), loadComments(null, null, null, true)
      ).toJS();
      expect(nextState.comments.length).toEqual(0);
    });

    it('returns provided comments if initialLoad is false', () => {
      const initialStateWithComments = initialState;
      let i = 0;
      while (i < 10) {
        initialStateWithComments.comments.push(i);
        i += 1;
      }

      const nextState = ideasShowReducer(
        fromJS(initialStateWithComments), loadComments(null, null, null, false)
      ).toJS();
      expect(nextState.comments.length).toEqual(i);
    });
  });

  describe('LOAD_COMMENTS_SUCCESS', () => {
    it('returns existing comments with new comments', () => {
      const initialStateWithComments = initialState;
      let i = 0;

      // comments from resources
      const payload = {
        data: [],
        links: {},
      };

      while (i < 20) {
        if (i < 10) {
          initialStateWithComments.comments.push(i);
        }
        if (i >= 10) {
          payload.data.push(generateResourcesCommentValue(i));
        }

        i += 1;
      }

      const nextState = ideasShowReducer(
        fromJS(initialStateWithComments), commentsLoaded(payload)
      ).toJS();
      expect(nextState.comments.length).toEqual(i + 10);
    });
  });

  describe('RESET_PAGE_DATA', () => {
    it('returns comments and votes as empty arrays, idea null and resetEditorContent false', () => {
      const nextState = ideasShowReducer(
        fromJS(initialState), resetPageData()
      ).toJS();
      expect(nextState.comments.length).toEqual(0);
      expect(nextState.idea).toBeNull();
      expect(nextState.resetEditorContent).toBeFalsy();
    });
  });

  describe('LOAD_IDEA_VOTES_SUCCESS', () => {
    it('returns existing votes with new votes', () => {
      const initialStateWithUpVotes = initialState;
      let i = 0;

      // comments from resources
      const payload = {
        data: [],
      };

      while (i < 20) {
        if (i < 10) {
          initialStateWithUpVotes.votes.push(i);
        }
        payload.data.push(generateResourcesVoteValue(i, false, false));

        i += 1;
      }

      const nextState = ideasShowReducer(
        fromJS(initialStateWithUpVotes), votesLoaded(payload)
      ).toJS();
      expect(nextState.votes.length).toEqual(i + 10);
    });
  });
});
