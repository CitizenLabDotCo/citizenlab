/**
 * Test sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { loadResources, loadResource, deleteResource } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { stringMock, mockNumber } from 'utils/testing/constants';

import { loadIdeasSaga, loadIdeaSaga, deleteIdeaSaga } from '../sagas';
import { deleteIdeaSuccess, loadIdeasSuccess, loadIdeaSuccess } from '../actions';

describe('resources/ideas sagas', () => {
  describe('loadIdeasSaga', () => {
    const mockedAction = {
      nextPageNumber: mockNumber,
      nextPageItemCount: mockNumber,
    };
    const it = sagaHelper(loadIdeasSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadResources, 'idea', {
        'page[number]': mockedAction.nextPageNumber,
        'page[size]': mockedAction.nextPageItemCount,
      }));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadIdeasSuccess action', (result) => {
      expect(result).toEqual(put(loadIdeasSuccess()));
    });
  });

  describe('loadIdeaSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(loadIdeaSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadResource, 'idea', mockedAction.id));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadIdeaSuccess action', (result) => {
      expect(result).toEqual(put(loadIdeaSuccess()));
    });
  });

  describe('deleteIdeaSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(deleteIdeaSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(deleteResource, 'idea', mockedAction.id));
    });

    it('then, should dispatch deleteIdeaSuccess action', (result) => {
      expect(result).toEqual(put(deleteIdeaSuccess(mockedAction.id)));
    });
  });
});
