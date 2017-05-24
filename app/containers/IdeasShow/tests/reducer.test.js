import { fromJS } from 'immutable';

import ideasShowReducer from '../reducer';
import { generateResourcesVoteValue, generateResourcesCommentValue } from './__shared';
import { loadCommentsSuccess, resetPageData, loadVotesSuccess, publishCommentSuccess, deleteCommentSuccess } from '../actions';

describe('ideasShowReducer', () => {
  const initialState = {
    idea: null,
    votes: [],
    comments: [],
    nextCommentPageNumber: null,
    nextCommentPageItemCount: null,
  };

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
        fromJS(initialStateWithComments), loadCommentsSuccess(payload)
      ).toJS();
      expect(nextState.comments.length).toEqual(i);
    });
  });

  describe('PUBLISH_COMMENT_SUCCESS', () => {
    it('returns existing comments with new comments', () => {
      const initialStateWithComments = initialState;
      // comments from resources
      const payload = generateResourcesCommentValue(12341234);
      const nextState = ideasShowReducer(
        fromJS(initialStateWithComments), publishCommentSuccess(payload)
      ).toJS();
      expect(nextState.comments.length).toEqual(11);
      expect(nextState.comments.indexOf(12341234)).not.toEqual(-1);
    });
  });

  describe('DELETE_COMMENT_SUCCESS', () => {
    it('returns existing comments with new comments', () => {
      const initialStateWithComments = initialState;
      // comments from resources

      const nextState = ideasShowReducer(
        fromJS(initialStateWithComments), deleteCommentSuccess(12341234)
      ).toJS();
      expect(nextState.comments.length).toEqual(9);
      expect(nextState.comments.indexOf(12341234)).toEqual(-1);
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
        fromJS(initialStateWithUpVotes), loadVotesSuccess(payload)
      ).toJS();
      expect(nextState.votes.length).toEqual(i + 10);
    });
  });
});
