import { takeLatest, call, put } from 'redux-saga/effects';
import { loadResources, createResource, loadResource, deleteResource, updateResource } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { loadPagesError, loadPagesSuccess, loadPageSuccess, loadPageError, deletePageSuccess, createPageSuccess } from './actions';
import { LOAD_PAGES_REQUEST, LOAD_PAGE_REQUEST, DELETE_PAGE_REQUEST } from './constants';

// Individual exports for testing
export function* loadPagesSaga(action) {
  const queryParameters = (action.initialLoad
    ? {}
    : {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });

  try {
    const response = yield call(loadResources, 'page', queryParameters);

    yield put(mergeJsonApiResources(response));
    yield put(loadPagesSuccess(response));
  } catch (e) {
    yield put(loadPagesError(e.json.erros));
  }
}

// Individual exports for testing
export function* loadPageSaga(action) {
  try {
    const response = yield call(loadResource, 'page', action.id);

    yield put(mergeJsonApiResources(response));
    yield put(loadPageSuccess());
  } catch (e) {
    yield put(loadPageError(e.json.errors));
  }
}

export function* createPageSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    body_multiloc: action.description,
  };
  try {
    const response = yield call(createResource, 'page', data);

    yield put(mergeJsonApiResources(response));
    yield put(createPageSuccess(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield success(e.json.errors);
  }
}

export function* createPageFork(action, success, error) {
  yield createPageSaga(action, success, error);
}

export function* updatePageSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    body_multiloc: action.description,
    slug: action.slug,
  };
  try {
    const response = yield call(updateResource, 'page', action.id, data);

    yield put(mergeJsonApiResources(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield error(e.json.errors);
  }
}

export function* updatePageFork(action, success, error) {
  yield updatePageSaga(action, success, error);
}

export function* deletePageSaga(action) {
  try {
    yield call(deleteResource, 'page', action.id);
    yield put(deletePageSuccess(action.id));
  } catch (e) {
    yield () => {};
  }
}

function* loadPagesWatcher() {
  yield takeLatest(LOAD_PAGES_REQUEST, loadPagesSaga);
}

function* loadPageWatcher() {
  yield takeLatest(LOAD_PAGE_REQUEST, loadPageSaga);
}

function* deletePageWatcher() {
  yield takeLatest(DELETE_PAGE_REQUEST, deletePageSaga);
}

export default {
  loadPagesWatcher,
  loadPageWatcher,
  deletePageWatcher,
};

