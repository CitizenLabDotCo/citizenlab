/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fetchProjects } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { objectMock } from 'utils/testing/constants';

import { getProjects } from '../sagas';
import { loadProjectsSuccess } from '../actions';

describe('ProjectsIndexPage sagas', () => {
  describe('getProjects', () => {
    const mockedAction = {
      initialLoad: true,
    };

    const it = sagaHelper(getProjects(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchProjects, objectMock));
    });

    it('then should dispatch mergeJsonApiResources', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadProjectsSuccess action', (result) => {
      expect(result).toEqual(put(loadProjectsSuccess()));
    });
  });
});
