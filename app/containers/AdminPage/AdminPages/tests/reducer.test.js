import { fromJS } from 'immutable';
import adminPageReducer from '../reducer';

describe('adminPagesReducer', () => {
  it('returns the initial state', () => {
    const expectedInitialState = {
      pages: [],
      prevPageNumber: null,
      prevPageItemCount: null,
      currentPageNumber: null,
      currentPageItemCount: null,
      nextPageNumber: null,
      nextPageItemCount: null,
      pageCount: null,
      loading: false,
      loadError: false,
    };

    expect(adminPageReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });
});
