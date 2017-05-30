/**
 * Test sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fetchProjects, createProject, fetchProject, deleteProject, updateProject } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { stringMock, mockNumber, objectMock, jestFn } from 'utils/testing/constants';

import { getProjects, fetchProjectSaga, publishProjectSaga, updateProjectSaga, deleteProjectSaga } from '../sagas';
import { loadProjectsSuccess, loadProjectSuccess, deleteProjectSuccess, publishProjectSuccess } from '../actions';

describe('resources/projects sagas', () => {
  describe('getProjects', () => {
    const mockedAction = {
      nextPageNumber: mockNumber,
      nextPageItemCount: mockNumber,
    };
    const it = sagaHelper(getProjects(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchProjects, {
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

  describe('fetchProjectSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(fetchProjectSaga(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchProject, mockedAction.id));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadProjectSuccess action', (result) => {
      expect(result).toEqual(put(loadProjectSuccess()));
    });
  });

  describe('publishProjectSaga', () => {
    const mockedAction = {
      title: objectMock,
      description: objectMock,
    };
    const it = sagaHelper(publishProjectSaga(mockedAction, jestFn, false));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(createProject, {
        title_multiloc: mockedAction.title,
        description_multiloc: mockedAction.description,
      }));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch publishProjectSuccess action', (result) => {
      expect(result).toEqual(put(publishProjectSuccess()));
    });

    // can't be tested as part of sagas (generator function returns undefined)
    // it('then, should call the provided success() handler', (result) => {
    //   expect(result).toEqual(jestFn);
    // });
  });

  describe('updateProjectSaga', () => {
    const mockedAction = {
      title: objectMock,
      description: objectMock,
      slug: stringMock,
      id: stringMock,
    };
    const it = sagaHelper(updateProjectSaga(mockedAction, jestFn, false));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(updateProject, mockedAction.id, {
        title_multiloc: mockedAction.title,
        description_multiloc: mockedAction.description,
        slug: mockedAction.slug,
      }));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    // can't be tested as part of sagas (generator function returns undefined)
    // it('then, should call the provided success() handler', (result) => {
    //   expect(result).toEqual(jestFn);
    // });
  });

  describe('deleteProjectSaga', () => {
    const mockedAction = {
      id: stringMock,
    };
    const it = sagaHelper(deleteProjectSaga(mockedAction, jestFn, false));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(deleteProject, mockedAction.id));
    });

    it('then, should dispatch deleteProjectSuccess action', (result) => {
      expect(result).toEqual(put(deleteProjectSuccess(mockedAction.id)));
    });
  });
});
