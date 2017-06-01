/**
 * Test sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { loadTopics, loadTopic, deleteTopic } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { stringMock, mockNumber } from 'utils/testing/constants';

import { loadTopicsSaga, loadTopicSaga, deleteTopicSaga } from '../sagas';
import { deleteTopicSuccess, loadTopicsSuccess, loadTopicSuccess } from '../actions';

describe('resources/topics sagas', () => {
  describe('loadTopicsSaga', () => {
    const mockedAction = {
      nextPageNumber: mockNumber,
      nextPageItemCount: mockNumber,
    };
    const it = sagaHelper(loadTopicsSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadTopics, {
        'page[number]': mockedAction.nextPageNumber,
        'page[size]': mockedAction.nextPageItemCount,
      }));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadTopicsSuccess action', (result) => {
      expect(result).toEqual(put(loadTopicsSuccess()));
    });
  });

  describe('loadTopicSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(loadTopicSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadTopic, mockedAction.id));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadTopicSuccess action', (result) => {
      expect(result).toEqual(put(loadTopicSuccess()));
    });
  });

  describe('deleteTopicSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(deleteTopicSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(deleteTopic, mockedAction.id));
    });

    it('then, should dispatch deleteTopicSuccess action', (result) => {
      expect(result).toEqual(put(deleteTopicSuccess(mockedAction.id)));
    });
  });
});
