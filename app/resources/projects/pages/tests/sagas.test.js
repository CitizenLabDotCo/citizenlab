/**
 * Test sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fetchPages } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { mockString } from 'utils/testing/constants';

import { loadProjectPagesSaga } from '../sagas';
import { loadProjectPagesSuccess } from '../actions';

describe('resources/projects/pages sagas', () => {
  describe('loadProjectPagesSaga', () => {
    const mockedAction = {
      payload: mockString,
    };
    const it = sagaHelper(loadProjectPagesSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchPages, {
        project: mockedAction.payload,
      }));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadProjectsSuccess action', (result) => {
      expect(result).toEqual(put(loadProjectPagesSuccess()));
    });
  });
});
