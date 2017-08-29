import { takeLatest, call, put } from 'redux-saga/effects';
import { loadResources, createResource, loadResource, deleteResource, updateResource } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { loadAreasError, loadAreasSuccess, loadAreaSuccess, loadAreaError, deleteAreaSuccess, createAreaSuccess } from './actions';
import { LOAD_AREAS_REQUEST, LOAD_AREA_REQUEST, DELETE_AREA_REQUEST } from './constants';

// Individual exports for testing
export function* loadAreasSaga(action) {
  const queryParameters = (action.initialLoad
    ? {}
    : {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });

  try {
    const response = yield call(loadResources, 'area', queryParameters);

    yield put(mergeJsonApiResources(response));
    yield put(loadAreasSuccess(response));
  } catch (e) {
    yield put(loadAreasError(e.json.erros));
  }
}

// Individual exports for testing
export function* loadAreaSaga(action) {
  try {
    const response = yield call(loadResource, 'area', action.id);

    yield put(mergeJsonApiResources(response));
    yield put(loadAreaSuccess());
  } catch (e) {
    yield put(loadAreaError(e.json.errors));
  }
}

export function* createAreaSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
  };
  try {
    const response = yield call(createResource, 'area', data);

    yield put(mergeJsonApiResources(response));
    yield put(createAreaSuccess(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield success(e.json.errors);
  }
}

export function* createAreaFork(action, success, error) {
  yield createAreaSaga(action, success, error);
}

export function* updateAreaSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
    slug: action.slug,
  };
  try {
    const response = yield call(updateResource, 'area', action.id, data);

    yield put(mergeJsonApiResources(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield error(e.json.errors);
  }
}

export function* updateAreaFork(action, success, error) {
  yield updateAreaSaga(action, success, error);
}

export function* deleteAreaSaga(action) {
  try {
    yield call(deleteResource, 'area', action.id);
    yield put(deleteAreaSuccess(action.id));
  } catch (e) {
    yield () => {};
  }
}

function* loadAreasWatcher() {
  yield takeLatest(LOAD_AREAS_REQUEST, loadAreasSaga);
}

function* loadAreaWatcher() {
  yield takeLatest(LOAD_AREA_REQUEST, loadAreaSaga);
}

function* deleteAreaWatcher() {
  yield takeLatest(DELETE_AREA_REQUEST, deleteAreaSaga);
}

export default {
  loadAreasWatcher,
  loadAreaWatcher,
  deleteAreaWatcher,
};

