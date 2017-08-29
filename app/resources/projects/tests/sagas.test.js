/**
 * Test sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { loadResources, loadResource, deleteResource } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { stringMock, mockNumber } from 'utils/testing/constants';

import { loadProjectsSaga, loadProjectSaga, deleteProjectSaga } from '../sagas';
import { deleteProjectSuccess, loadProjectsSuccess, loadProjectSuccess } from '../actions';

describe('resources/projects sagas', () => {
  describe('loadProjectsSaga', () => {
    const mockedAction = {
      nextPageNumber: mockNumber,
      nextPageItemCount: mockNumber,
    };
    const it = sagaHelper(loadProjectsSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadResources, 'project', {
        'page[number]': mockedAction.nextPageNumber,
        'page[size]': mockedAction.nextPageItemCount,
      }));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadProjectsSuccess action', (result) => {
      expect(result).toEqual(put(loadProjectsSuccess()));
    });
  });

  describe('loadProjectSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(loadProjectSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(loadResource, 'project', mockedAction.id));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadProjectSuccess action', (result) => {
      expect(result).toEqual(put(loadProjectSuccess()));
    });
  });

  describe('deleteProjectSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(deleteProjectSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(deleteResource, 'project', mockedAction.id));
    });

    it('then, should dispatch deleteProjectSuccess action', (result) => {
      expect(result).toEqual(put(deleteProjectSuccess(mockedAction.id)));
    });
  });
});
