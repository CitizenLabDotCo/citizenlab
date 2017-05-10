/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fetchPages } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { localStorageMock } from 'utils/testing/methods';

import { getPages } from '../sagas';
import { loadPagesSuccess } from '../actions';

describe('AdminPages sagas', () => {
  // mock localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock() });

  describe('getPages', () => {
    const it = sagaHelper(getPages());

    it('should have called the correct API', (result) => {
      // TODO: fir this
      expect(result).toEqual(call(fetchPages));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources(undefined)));
    });

    it('then, should dispatch loadPagesSuccess action', (result) => {
      expect(result).toEqual(put(loadPagesSuccess(undefined, undefined)));
    });
  });
});
