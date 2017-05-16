/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fetchUsersReport, fetchIdeaTopicsReport, fetchIdeaAreasReport } from 'api';

import { getUsersReport, getIdeaTopicsReport, getIdeaAreasReport } from '../sagas';
import { loadIdeaAreasReportSuccess, loadIdeaTopicsReportSuccess, loadUsersReportSuccess } from '../actions';

describe('AdminDashboard sagas', () => {
  describe('getUsersReport', () => {
    const it = sagaHelper(getUsersReport({}));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchUsersReport, {}));
    });

    it('then, should dispatch loadUsersReportSuccess action', (result) => {
      expect(result).toEqual(put(loadUsersReportSuccess()));
    });
  });

  describe('getIdeaTopicsReport', () => {
    const it = sagaHelper(getIdeaTopicsReport({}));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchIdeaTopicsReport, {}));
    });

    // TODO: add mergeJsonApiResource (not for users report)

    it('then, should dispatch loadIdeaTopicsReportSuccess action', (result) => {
      expect(result).toEqual(put(loadIdeaTopicsReportSuccess()));
    });
  });

  describe('getUsersReport', () => {
    const it = sagaHelper(getIdeaAreasReport({}));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchIdeaAreasReport, {}));
    });

    // TODO: add mergeJsonApiResource (not for users report)

    it('then, should dispatch loadIdeaAreasReportSuccess action', (result) => {
      expect(result).toEqual(put(loadIdeaAreasReportSuccess()));
    });
  });
});
