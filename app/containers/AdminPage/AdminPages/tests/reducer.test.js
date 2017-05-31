import { fromJS } from 'immutable';
import { generateResourcesPageValue } from 'utils/testing/mocks';
import { numberMock, linkMock } from 'utils/testing/constants';
import { expectPropertyNotNull } from 'utils/testing/methods';

import adminPageReducer from '../reducer';
import { loadPagesSuccess } from '../actions';


describe('adminPagesReducer', () => {
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

  it('returns the initial state', () => {
    expect(adminPageReducer(undefined, {})).toEqual(fromJS(expectedInitialState));
  });

  describe('LOAD_PAGES_SUCCESS', () => {
    const apiResponse = {
      data: [],
      links: [],
    };
    const pageIds = [];
    for (let i = 0; i < 10; i += 1) {
      apiResponse.data.push(generateResourcesPageValue(i.toString()).data);
      pageIds.push(i.toString());
    }

    it('should return ids of the pages passed in', () => {
      const nextState = adminPageReducer(
        fromJS(expectedInitialState), loadPagesSuccess(apiResponse, numberMock)
      ).toJS();

      expect(nextState.pages).toEqual(pageIds);
    });

    it('should return prevPageNumber and prevPageItemCount not null if links.prev is not null', () => {
      apiResponse.links.prev = linkMock;

      const nextState = adminPageReducer(
        fromJS(expectedInitialState), loadPagesSuccess(apiResponse, numberMock)
      ).toJS();

      expectPropertyNotNull(nextState, 'prevPageNumber');
      expectPropertyNotNull(nextState, 'prevPageItemCount');
    });

    it('should return currentPageNumber and currentPageItemCount not null if links.self is not null', () => {
      apiResponse.links.self = linkMock;

      const nextState = adminPageReducer(
        fromJS(expectedInitialState), loadPagesSuccess(apiResponse, numberMock)
      ).toJS();

      expectPropertyNotNull(nextState, 'currentPageNumber');
      expectPropertyNotNull(nextState, 'currentPageItemCount');
    });

    it('should return nextPageNumber and nextPageItemCount not null if links.next is not null', () => {
      apiResponse.links.next = linkMock;

      const nextState = adminPageReducer(
        fromJS(expectedInitialState), loadPagesSuccess(apiResponse, numberMock)
      ).toJS();

      expectPropertyNotNull(nextState, 'nextPageNumber');
      expectPropertyNotNull(nextState, 'nextPageItemCount');
    });

    it('should return pageCount not null if links.last is not null', () => {
      apiResponse.links.last = linkMock;

      const nextState = adminPageReducer(
        fromJS(expectedInitialState), loadPagesSuccess(apiResponse, numberMock)
      ).toJS();

      expectPropertyNotNull(nextState, 'pageCount');
    });
  });
});
