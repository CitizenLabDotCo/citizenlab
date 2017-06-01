/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { createPage } from 'api';
import { localStorageMock } from 'utils/testing/methods';
import { objectMock } from 'utils/testing/constants';

import { postPage } from '../sagas';
import { publishPageSuccess } from '../actions';

describe('AdminPages sagas', () => {
  // mock localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock() });

  describe('postPage', () => {
    const mockedAction = {
      title_multiloc: objectMock,
      body_multiloc: objectMock,
    };

    const it = sagaHelper(postPage(mockedAction));

    it('should have called the correct API', (result) => {
      const { payload, titles } = mockedAction;
      const requestBody = {
        title_multiloc: payload,
        body_multiloc: titles,
      };
      expect(result).toEqual(call(createPage, requestBody));
    });

    it('then should dispatch mergeJsonApiResources', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch ideaPublished action', (result) => {
      expect(result).toEqual(put(publishPageSuccess()));
    });
  });
});
