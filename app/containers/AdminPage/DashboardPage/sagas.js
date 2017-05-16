/*
 *
 * AdminPage/DashboardPage sagas
 *
 */
import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { fetchUsersReport, fetchIdeaTopicsReport, fetchIdeaAreasReport } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';

import {
  loadIdeaAreasReportError, loadIdeaAreasReportSuccess, loadIdeaTopicsReportError, loadIdeaTopicsReportSuccess,
  loadUsersReportError, loadUsersReportSuccess,
} from './actions';
import {
  LOAD_IDEA_AREAS_REPORT_REQUEST, LOAD_IDEA_TOPICS_REPORT_REQUEST, LOAD_USERS_REPORT_REQUEST,
} from './constants';

export function* getUsersReport(action) {
  try {
    const response = yield call(fetchUsersReport, {
      start_at: action.startAt,
      end_at: action.endAt,
      interval: action.interval,
    });

    yield put(loadUsersReportSuccess(response));
  } catch (err) {
    yield put(loadUsersReportError(JSON.stringify(err)));
  }
}

export function* getIdeaTopicsReport(action) {
  try {
    const response = yield call(fetchIdeaTopicsReport, {
      start_at: action.startAt,
      end_at: action.endAt,
    });

    yield put(mergeJsonApiResources(response));
    yield put(loadIdeaTopicsReportSuccess(response));
  } catch (err) {
    yield put(loadIdeaTopicsReportError(JSON.stringify(err)));
  }
}

export function* getIdeaAreasReport(action) {
  try {
    const response = yield call(fetchIdeaAreasReport, {
      start_at: action.startAt,
      end_at: action.endAt,
    });

    yield put(mergeJsonApiResources(response));
    yield put(loadIdeaAreasReportSuccess(response));
  } catch (err) {
    yield put(loadIdeaAreasReportError(JSON.stringify(err)));
  }
}

function* watchGetUsersReport() {
  yield takeLatest(LOAD_USERS_REPORT_REQUEST, getUsersReport);
}

function* watchGetIdeaTopicsReport() {
  yield takeLatest(LOAD_IDEA_TOPICS_REPORT_REQUEST, getIdeaTopicsReport);
}

function* watchGetIdeaAreasReport() {
  yield takeLatest(LOAD_IDEA_AREAS_REPORT_REQUEST, getIdeaAreasReport);
}

export default {
  watchGetUsersReport,
  watchGetIdeaTopicsReport,
  watchGetIdeaAreasReport,
};
