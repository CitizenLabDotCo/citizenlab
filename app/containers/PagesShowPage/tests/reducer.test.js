import { numberMock } from 'utils/testing/constants';
import { generateResourcesPageValue } from 'utils/testing/mocks';

import pagesShowPageReducer, { initialState } from '../reducer';
import { loadPageSuccess } from '../actions';

describe('pagesShowPageReducer', () => {
  describe('LOAD_PAGE_SUCCESS', () => {
    it('should set page to the id of page provided', () => {
      const state = initialState;

      // page id is a string, but any primitive will work for the purposes for the test
      const mockedResponse = generateResourcesPageValue(numberMock);
      expect(pagesShowPageReducer(state, loadPageSuccess(mockedResponse)).get('page')).toEqual(numberMock);
    });
  });
});
