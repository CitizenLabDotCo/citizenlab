// import React from 'react';
import { mapDispatchToProps } from '../index';
import { loadAreasRequest, loadIdeasRequest, loadTopicsRequest, resetIdeas } from '../actions';
import { numberMock, objectMock } from '../../../utils/testing/constants';
// import { shallow } from 'enzyme';

// import { IdeasIndexPage } from '../index';

describe('<IdeasIndexPage />', () => {
  describe('mapDispatchToProps', () => {
    const dispatch = jest.fn();
    const result = mapDispatchToProps(dispatch);

    describe('initData', () => {
      it('should dispatch loadIdeasRequest, loadTopicsRequest and loadAreasRequest', () => {
        result.initData(null);
        expect(dispatch).toHaveBeenCalledWith(loadIdeasRequest(true));
        expect(dispatch).toHaveBeenCalledWith(loadTopicsRequest());
        expect(dispatch).toHaveBeenCalledWith(loadAreasRequest());
      });
    });

    describe('loadNextPage', () => {
      it('should dispatch loadIdeasRequest with correct parameters', () => {
        result.loadNextPage(numberMock, numberMock, objectMock);
        expect(dispatch).toHaveBeenCalledWith(loadIdeasRequest(false, numberMock, numberMock, objectMock));
      });
    });

    describe('resetData', () => {
      it('should dispatch resetIdeas', () => {
        result.resetData(null);
        expect(dispatch).toHaveBeenCalledWith(resetIdeas());
      });
    });

    describe('reloadIdeas', () => {
      it('should dispatch loadIdeasRequest', () => {
        result.reloadIdeas(objectMock);

        const actionParameter = {
          filters: objectMock,
        };

        expect(dispatch).toHaveBeenCalledWith(loadIdeasRequest(actionParameter));
      });
    });
  });
});
