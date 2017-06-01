/**
 * Test sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { loadResources, loadResource, deleteResource } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { stringMock, mockNumber } from 'utils/testing/constants';

import { loadEventsSaga, loadEventSaga, deleteEventSaga } from '../sagas';
import { deleteEventSuccess, loadEventsSuccess, loadEventSuccess } from '../actions';

describe('resources/events sagas', () => {
  describe('loadEventsSaga', () => {
    const mockedAction = {
      nextPageNumber: mockNumber,
      nextPageItemCount: mockNumber,
    };
    const it = sagaHelper(loadEventsSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadResources, 'event', {
        'page[number]': mockedAction.nextPageNumber,
        'page[size]': mockedAction.nextPageItemCount,
      }));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadEventsSuccess action', (result) => {
      expect(result).toEqual(put(loadEventsSuccess()));
    });
  });

  describe('loadEventSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(loadEventSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadResource, 'event', mockedAction.id));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadEventSuccess action', (result) => {
      expect(result).toEqual(put(loadEventSuccess()));
    });
  });

  describe('deleteEventSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(deleteEventSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(deleteResource, 'event', mockedAction.id));
    });

    it('then, should dispatch deleteEventSuccess action', (result) => {
      expect(result).toEqual(put(deleteEventSuccess(mockedAction.id)));
    });
  });
});
