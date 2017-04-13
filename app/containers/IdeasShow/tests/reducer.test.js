
import { fromJS } from 'immutable';
import ideasShowReducer from '../reducer';

describe('ideasShowReducer', () => {
  it('returns the initial state', () => {
    const expectedInitialState = {
      idea: null,
      commentContent: null,
      storeCommentError: null,
      loadCommentsError: null,
      loadingComments: false,
      submittingComment: false,
      comments: [],
    };

    expect(ideasShowReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });
});
