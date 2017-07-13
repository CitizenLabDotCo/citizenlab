import { takeLatest, call, put } from 'redux-saga/effects';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import {
  LOAD_NOTIFICATIONS_REQUEST, MARK_ALL_NOTIFICATIONS_READ_REQUEST, MARK_NOTIFICATION_READ_REQUEST,
} from './constants';
import {
  loadNotificationsError, loadNotificationsSuccess, markAllNotificationsAsReadError, markAllNotificationsAsReadSuccess,
  markNotificationAsReadError, markNotificationAsReadSuccess,
} from './actions';

// Individual exports for testing
export function* loadNotifications(action) {
  const queryParameters = {
    'page[number]': action.nextPageNumber,
    'page[size]': action.nextPageItemCount,
  };

  try {
    const response = yield call(fetchNotifications, queryParameters);

    yield put(mergeJsonApiResources(response));
    yield put(loadNotificationsSuccess(response));
  } catch (e) {
    yield put(loadNotificationsError(e.json.errors));
  }
}

export function* markNotificationAsRead(action) {
  try {
    const response = yield call(markNotificationRead, action.payload);

    yield put(mergeJsonApiResources(response));
    yield put(markNotificationAsReadSuccess(response));
  } catch (e) {
    yield put(markNotificationAsReadError(e.json.errors));
  }
}

export function* markAllNotificationsAsRead() {
  try {
    const response = yield call(markAllNotificationsRead);

    yield put(mergeJsonApiResources(response));
    yield put(markAllNotificationsAsReadSuccess(response));
  } catch (e) {
    yield put(markAllNotificationsAsReadError(e.json.errors));
  }
}


function* loadNotificationsWatcher() {
  yield takeLatest(LOAD_NOTIFICATIONS_REQUEST, loadNotifications);
}

function* markNotificationAsReadWatcher() {
  yield takeLatest(MARK_NOTIFICATION_READ_REQUEST, markNotificationAsRead);
}

function* markAllNotificationsAsReadWatcher() {
  yield takeLatest(MARK_ALL_NOTIFICATIONS_READ_REQUEST, markAllNotificationsAsRead);
}

export default {
  loadNotificationsWatcher,
  markNotificationAsReadWatcher,
  markAllNotificationsAsReadWatcher,
};

