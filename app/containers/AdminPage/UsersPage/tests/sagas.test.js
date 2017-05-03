/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { getUsers } from '../sagas';
import { mergeJsonApiResources } from '../../../../utils/resources/actions';
import { fetchUsers } from '../../../../api';
import { localStorageMock } from '../../../../utils/testUtils';
import { usersLoaded } from '../actions';

describe('UsersPage sagas', () => {
  // mock localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock() });

  describe('getUsers', () => {
    const it = sagaHelper(getUsers());

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchUsers));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources(undefined)));
    });

    it('then, should dispatch usersLoaded action', (result) => {
      expect(result).toEqual(put(usersLoaded(undefined)));
    });
  });
});
