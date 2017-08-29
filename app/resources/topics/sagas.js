import { takeLatest, call, put } from 'redux-saga/effects';
import { loadResources, createResource, loadResource, deleteResource, updateResource } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { loadTopicsError, loadTopicsSuccess, loadTopicSuccess, loadTopicError, deleteTopicSuccess, createTopicSuccess } from './actions';
import { LOAD_TOPICS_REQUEST, LOAD_TOPIC_REQUEST, DELETE_TOPIC_REQUEST } from './constants';

// Individual exports for testing
export function* loadTopicsSaga(action) {
  const queryParameters = (action.initialLoad
    ? {}
    : {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });

  try {
    const response = yield call(loadResources, 'topic', queryParameters);

    yield put(mergeJsonApiResources(response));
    yield put(loadTopicsSuccess(response));
  } catch (e) {
    yield put(loadTopicsError(e.json.erros));
  }
}

// Individual exports for testing
export function* loadTopicSaga(action) {
  try {
    const response = yield call(loadResource, 'topic', action.id);

    yield put(mergeJsonApiResources(response));
    yield put(loadTopicSuccess());
  } catch (e) {
    yield put(loadTopicError(e.json.errors));
  }
}

export function* createTopicSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
  };
  try {
    const response = yield call(createResource, 'topic', data);

    yield put(mergeJsonApiResources(response));
    yield put(createTopicSuccess(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield success(e.json.errors);
  }
}

export function* createTopicFork(action, success, error) {
  yield createTopicSaga(action, success, error);
}

export function* updateTopicSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
    slug: action.slug,
  };
  try {
    const response = yield call(updateResource, 'topic', action.id, data);

    yield put(mergeJsonApiResources(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield error(e.json.errors);
  }
}

export function* updateTopicFork(action, success, error) {
  yield updateTopicSaga(action, success, error);
}

export function* deleteTopicSaga(action) {
  try {
    yield call(deleteResource, 'topic', action.id);
    yield put(deleteTopicSuccess(action.id));
  } catch (e) {
    yield () => {};
  }
}

function* loadTopicsWatcher() {
  yield takeLatest(LOAD_TOPICS_REQUEST, loadTopicsSaga);
}

function* loadTopicWatcher() {
  yield takeLatest(LOAD_TOPIC_REQUEST, loadTopicSaga);
}

function* deleteTopicWatcher() {
  yield takeLatest(DELETE_TOPIC_REQUEST, deleteTopicSaga);
}

export default {
  loadTopicsWatcher,
  loadTopicWatcher,
  deleteTopicWatcher,
};

