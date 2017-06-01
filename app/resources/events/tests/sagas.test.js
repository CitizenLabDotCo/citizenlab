/**
 * Test sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { loadAreas, loadArea, deleteArea } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { stringMock, mockNumber } from 'utils/testing/constants';

import { loadAreasSaga, loadAreaSaga, deleteAreaSaga } from '../sagas';
import { deleteAreaSuccess, loadAreasSuccess, loadAreaSuccess } from '../actions';

describe('resources/events sagas', () => {
  describe('loadAreasSaga', () => {
    const mockedAction = {
      nextPageNumber: mockNumber,
      nextPageItemCount: mockNumber,
    };
    const it = sagaHelper(loadAreasSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadAreas, {
        'page[number]': mockedAction.nextPageNumber,
        'page[size]': mockedAction.nextPageItemCount,
      }));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadAreasSuccess action', (result) => {
      expect(result).toEqual(put(loadAreasSuccess()));
    });
  });

  describe('loadAreaSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(loadAreaSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadArea, mockedAction.id));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadAreaSuccess action', (result) => {
      expect(result).toEqual(put(loadAreaSuccess()));
    });
  });

  describe('deleteAreaSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(deleteAreaSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(deleteArea, mockedAction.id));
    });

    it('then, should dispatch deleteAreaSuccess action', (result) => {
      expect(result).toEqual(put(deleteAreaSuccess(mockedAction.id)));
    });
  });
});
