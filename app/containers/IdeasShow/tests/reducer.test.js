
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
    };

    expect(ideasShowReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });
});
