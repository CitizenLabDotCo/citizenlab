/**
 * Test sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fetchTopics } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { mockNumber } from 'utils/testing/constants';

import { loadTopicsSaga } from '../sagas';
import { loadTopicsSuccess } from '../actions';

describe('resources/topics sagas', () => {
  describe('loadTopicsSaga', () => {
    const mockedAction = {
      nextPageNumber: mockNumber,
      nextPageItemCount: mockNumber,
    };
    const it = sagaHelper(loadTopicsSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchTopics, {
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
});
