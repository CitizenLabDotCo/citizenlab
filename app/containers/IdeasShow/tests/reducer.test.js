
import { fromJS } from 'immutable';
import ideasShowReducer from '../reducer';

describe('ideasShowReducer', () => {
  it('returns the initial state', () => {
    const expectedInitialState = {
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
    };

    expect(ideasShowReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });

  describe('LOAD_IDEA_ERROR', () => {
    it('returns loadIdeaError not null if error is provided', () => {
      // TODO
      expect(true).toEqual(true);
    });
  });

  describe('LOAD_COMMENTS_REQUEST', () => {
    it('returns empty comment array if initialLoad is true', () => {
      // TODO
      expect(true).toEqual(true);
    });

    it('returns provided comments if initialLoad is false', () => {
      // TODO
      expect(true).toEqual(true);
    });
  });

  describe('LOAD_COMMENTS_SUCCESS', () => {
    it('returns existing comments with new comments', () => {
      expect(true).toEqual(true);
    });

    it('returns nextCommentPageNumber and nextCommentPageItemCount not null if they\'re provided', () => {
      // TODO (expectPropertyNotNull ...)
      expect(true).toEqual(true);
    });
  });

  describe('STORE_COMMENT_ERROR', () => {
    it('RETURN storeCommentError not null if error is provided', () => {
      // TODO
      expect(true).toEqual(true);
    });
  });

  describe('RESET_IDEA_AND_COMMENTS', () => {
    it('returns comments as an empty array, idea not null and resetEditorContent false', () => {
      // TODO
      expect(true).toEqual(true);
    });
  });
});
