/**
 * Test sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { loadResources, loadResource, deleteResource } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { stringMock, mockNumber } from 'utils/testing/constants';

import { loadUsersSaga, loadUserSaga, deleteUserSaga } from '../sagas';
import { deleteUserSuccess, loadUsersSuccess, loadUserSuccess } from '../actions';

describe('resources/users sagas', () => {
  describe('loadUsersSaga', () => {
    const mockedAction = {
      queryParams: {
        'page[number]': mockNumber,
        'page[size]': mockNumber,
      },
    };
    const it = sagaHelper(loadUsersSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadResources, 'user', {
        'page[number]': mockedAction.nextPageNumber,
        'page[size]': mockedAction.nextPageItemCount,
      }));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadUsersSuccess action', (result) => {
      expect(result).toEqual(put(loadUsersSuccess()));
    });
  });

  describe('loadUserSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(loadUserSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadResource, 'user', mockedAction.id));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadUserSuccess action', (result) => {
      expect(result).toEqual(put(loadUserSuccess()));
    });
  });

  describe('deleteUserSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(deleteUserSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(deleteResource, 'user', mockedAction.id));
    });

    it('then, should dispatch deleteUserSuccess action', (result) => {
      expect(result).toEqual(put(deleteUserSuccess(mockedAction.id)));
    });
  });
});
