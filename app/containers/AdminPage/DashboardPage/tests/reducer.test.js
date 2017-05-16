import { fromJS } from 'immutable';
// import { numberMock, stringMock, linkMock } from 'utils/testing/constants';
// import { expectPropertyNotNull } from 'utils/testing/methods';

import dashboardPage from '../reducer';


describe('adminPagesReducer', () => {
  const expectedInitialState = {
    newUsers: {
      loading: false,
      data: {},
      loadError: false,
      prevPageNumber: null,
      currentPageNumber: null,
      nextPageNumber: null,
      lastPageNumber: null,
    },
    ideasByTopic: {
      loading: false,
      data: {},
      loadError: false,
    },
    ideasByArea: {
      loading: false,
      data: {},
      loadError: false,
    },
  };

  it('returns the initial state', () => {
    expect(dashboardPage(undefined, {})).toEqual(fromJS(expectedInitialState));
  });

  describe('setInForTimedReport', () => {
    it('should set all the relevant report properties', () => {
     // TODO (incl. 1+ tests on pagination)
      expect(true).toEqual(true);
    });
  });
});
