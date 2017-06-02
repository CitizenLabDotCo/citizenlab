import { takeLatest, call, put } from 'redux-saga/effects';
import { loadResources, createResource, loadResource, deleteResource, updateResource } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { loadEventsError, loadEventsSuccess, loadEventSuccess, loadEventError, deleteEventSuccess, createEventSuccess } from './actions';
import { LOAD_EVENTS_REQUEST, LOAD_EVENT_REQUEST, DELETE_EVENT_REQUEST } from './constants';

// Individual exports for testing
export function* loadEventsSaga(action) {
  const queryParameters = (action.initialLoad
    ? {}
    : {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });

  try {
    const response = yield call(loadResources, 'event', queryParameters);

    yield put(mergeJsonApiResources(response));
    yield put(loadEventsSuccess(response));
  } catch (e) {
    yield put(loadEventsError(e.json.erros));
  }
}

// Individual exports for testing
export function* loadEventSaga(action) {
  try {
    const response = yield call(loadResource, 'event', action.id);

    yield put(mergeJsonApiResources(response));
    yield put(loadEventSuccess());
  } catch (e) {
    yield put(loadEventError(e.json.errors));
  }
}

export function* createEventSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
  };
  try {
    const response = yield call(createResource, 'event', data);

    yield put(mergeJsonApiResources(response));
    yield put(createEventSuccess(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield success(e.json.errors);
  }
}

export function* createEventFork(action, success, error) {
  yield createEventSaga(action, success, error);
}

export function* updateEventSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
    slug: action.slug,
  };
  try {
    const response = yield call(updateResource, 'event', action.id, data);

    yield put(mergeJsonApiResources(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield error(e.json.errors);
  }
}

export function* updateEventFork(action, success, error) {
  yield updateEventSaga(action, success, error);
}

export function* deleteEventSaga(action) {
  try {
    yield call(deleteResource, 'event', action.id);
    yield put(deleteEventSuccess(action.id));
  } catch (e) {
    yield () => {};
  }
}

function* loadEventsWatcher() {
  yield takeLatest(LOAD_EVENTS_REQUEST, loadEventsSaga);
}

function* loadEventWatcher() {
  yield takeLatest(LOAD_EVENT_REQUEST, loadEventSaga);
}

function* deleteEventWatcher() {
  yield takeLatest(DELETE_EVENT_REQUEST, deleteEventSaga);
}

export default {
  loadEventsWatcher,
  loadEventWatcher,
  deleteEventWatcher,
};

