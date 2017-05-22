/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fetchPage } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { numberMock } from 'utils/testing/constants';

import { loadPageSuccess } from '../actions';
import { getPage } from '../sagas';


describe('PagesShowPage sagas', () => {
  describe('getPage', () => {
    const mockedAction = {
      payload: numberMock,
    };

    const it = sagaHelper(getPage(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchPage, numberMock));
    });

    it('then should dispatch mergeJsonApiResources', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch ideaPublished action', (result) => {
      expect(result).toEqual(put(loadPageSuccess()));
    });
  });
});

