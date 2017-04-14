
import { fromJS } from 'immutable';
import ideasIndexPageReducer from '../reducer';

describe('ideasIndexPageReducer', () => {
  it('returns the initial state', () => {
    const expectedInitialState = {
      nextPageNumber: null,
      nextPageItemCount: null,
      ideas: [],
      loading: false,
      showIdeaWithIndexPage: false,
    };

    expect(ideasIndexPageReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });
});
