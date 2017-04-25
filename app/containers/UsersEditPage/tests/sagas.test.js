/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { getProfile } from '../sagas';
import { mergeJsonApiResources } from '../../../utils/resources/actions';
import { fetchCurrentUser } from '../../../api';
import { localStorageMock } from '../../../utils/testing/methods';
import { loadCurrentUserSuccess } from '../../../utils/auth/actions';

describe('UserEditPage sagas', () => {
  // mock localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock() });

  describe('getProfile', () => {
    const it = sagaHelper(getProfile());

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchCurrentUser));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadCurrentUserSuccess action', (result) => {
      expect(result).toEqual(put(loadCurrentUserSuccess()));
    });
  });
});
