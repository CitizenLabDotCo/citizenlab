/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { numberMock, objectMock } from '../../../utils/testing/constants';
import { fetchAreas, fetchIdeas, fetchTopics } from '../../../api';
import { getAreas, getIdeas, getTopics } from '../sagas';
import { mergeJsonApiResources } from '../../../utils/resources/actions';
import { loadAreasSuccess, loadIdeasSuccess, loadTopicsSuccess } from '../actions';

describe('IdeasIndexPage Saga', () => {
  describe('getIdeas', () => {
    const action = {
      nextPageNumber: numberMock,
      nextPageItemCount: numberMock,
      filters: objectMock,
    };

    const it = sagaHelper(getIdeas(action));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchIdeas, {
        'page[number]': action.nextPageNumber,
        'page[size]': action.nextPageItemCount,
        ...action.filters,
      }));
    });

    it('then should dispatch mergeJsonApiResources', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadIdeasSuccess action', (result) => {
      expect(result).toEqual(put(loadIdeasSuccess()));
    });
  });

  describe('getTopics', () => {
    const action = {
      nextPageNumber: numberMock,
      nextPageItemCount: numberMock,
    };

    const it = sagaHelper(getTopics(action));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchTopics, {
        'page[number]': action.nextPageNumber,
        'page[size]': action.nextPageItemCount,
      }));
    });

    it('then should dispatch mergeJsonApiResources', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadTopicsSuccess action', (result) => {
      expect(result).toEqual(put(loadTopicsSuccess()));
    });
  });

  describe('getAreas', () => {
    const action = {
      nextPageNumber: numberMock,
      nextPageItemCount: numberMock,
    };

    const it = sagaHelper(getAreas(action));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchAreas, {
        'page[number]': action.nextPageNumber,
        'page[size]': action.nextPageItemCount,
      }));
    });

    it('then should dispatch mergeJsonApiResources', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadAreasSuccess action', (result) => {
      expect(result).toEqual(put(loadAreasSuccess()));
    });
  });
});
