/**
 * Test sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { loadPages, loadPage, deletePage } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { stringMock, mockNumber } from 'utils/testing/constants';

import { loadPagesSaga, loadPageSaga, deletePageSaga } from '../sagas';
import { deletePageSuccess, loadPagesSuccess, loadPageSuccess } from '../actions';

describe('resources/pages sagas', () => {
  describe('loadPagesSaga', () => {
    const mockedAction = {
      nextPageNumber: mockNumber,
      nextPageItemCount: mockNumber,
    };
    const it = sagaHelper(loadPagesSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadPages, {
        'page[number]': mockedAction.nextPageNumber,
        'page[size]': mockedAction.nextPageItemCount,
      }));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadPagesSuccess action', (result) => {
      expect(result).toEqual(put(loadPagesSuccess()));
    });
  });

  describe('loadPageSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(loadPageSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadPage, mockedAction.id));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadPageSuccess action', (result) => {
      expect(result).toEqual(put(loadPageSuccess()));
    });
  });

  describe('deletePageSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(deletePageSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(deletePage, mockedAction.id));
    });

    it('then, should dispatch deletePageSuccess action', (result) => {
      expect(result).toEqual(put(deletePageSuccess(mockedAction.id)));
    });
  });
});
