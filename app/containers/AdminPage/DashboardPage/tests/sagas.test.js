/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fetchUsersReport, fetchIdeaTopicsReport, fetchIdeaAreasReport } from 'api';
import { stringMock } from 'utils/testing/constants';

import { getUsersReport, getIdeaTopicsReport, getIdeaAreasReport } from '../sagas';
import { loadIdeaAreasReportSuccess, loadIdeaTopicsReportSuccess, loadUsersReportSuccess } from '../actions';

describe('AdminDashboard sagas', () => {
  const queryParameters = {
    start_at: stringMock,
    end_at: stringMock,
  };

  const mockedAction = {
    startAt: queryParameters.start_at,
    endAt: queryParameters.end_at,
    interval: stringMock,
  };

  describe('getUsersReport', () => {
    const mockedActionCustom = mockedAction;
    delete mockedActionCustom.interval;
    const it = sagaHelper(getUsersReport(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchUsersReport, queryParameters));
    });

    it('then, should dispatch loadUsersReportSuccess action', (result) => {
      expect(result).toEqual(put(loadUsersReportSuccess(undefined)));
    });
  });

  describe('getIdeaTopicsReport', () => {
    const it = sagaHelper(getIdeaTopicsReport(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchIdeaTopicsReport, queryParameters));
    });

    it('then, should dispatch loadIdeaTopicsReportSuccess action', (result) => {
      expect(result).toEqual(put(loadIdeaTopicsReportSuccess(undefined)));
    });
  });

  describe('getUsersReport', () => {
    const it = sagaHelper(getIdeaAreasReport(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchIdeaAreasReport, queryParameters));
    });

    it('then, should dispatch loadIdeaAreasReportSuccess action', (result) => {
      expect(result).toEqual(put(loadIdeaAreasReportSuccess(undefined)));
    });
  });
});
