/**
 * Test sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fetchProjectPhases } from 'api';
//
import { mergeJsonApiResources } from 'utils/resources/actions';
import { mockString } from 'utils/testing/constants';

import { loadProjectPhasesSaga } from '../sagas';
import { loadProjectPhasesSuccess } from '../actions';

describe('resources/projects/phases sagas', () => {
  describe('loadProjectPhasesSaga', () => {
    const mockedAction = {
      payload: mockString,
    };
    const it = sagaHelper(loadProjectPhasesSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchProjectPhases, mockedAction.payload));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadProjectsSuccess action', (result) => {
      expect(result).toEqual(put(loadProjectPhasesSuccess()));
    });
  });
});
