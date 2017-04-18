import { fromJS } from 'immutable';
import ideasShowReducer from '../reducer';
import { expectPropertyNotNull } from '../../../utils/testUtils';
import { commentsLoaded, ideaLoadError, loadComments, resetIdeaAndComments } from '../actions';
import { generateResourcesCommentValue } from './__shared';

describe('ideasShowReducer', () => {
  const initialState = {
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
  const mockString = 'anything';

  it('returns the initial state', () => {
    expect(ideasShowReducer(undefined, {})).toEqual(fromJS(initialState));
  });

  describe('LOAD_IDEA_ERROR', () => {
    it('returns loadIdeaError not null if error is provided', () => {
      const nextState = ideasShowReducer(
        fromJS(initialState), ideaLoadError(mockString)
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

  describe('RESET_IDEA_AND_COMMENTS', () => {
    it('returns comments as an empty array, idea null and resetEditorContent false', () => {
      const nextState = ideasShowReducer(
        fromJS(initialState), resetIdeaAndComments()
      ).toJS();
      expect(nextState.comments.length).toEqual(0);
      expect(nextState.idea).toBeNull();
      expect(nextState.resetEditorContent).toBeFalsy();
    });
  });
});
