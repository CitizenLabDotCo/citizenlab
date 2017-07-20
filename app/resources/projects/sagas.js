import { takeLatest, call, put, fork } from 'redux-saga/effects';
import { loadResources, createResource, loadResource, deleteResource, updateResource } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { loadProjectsError, loadProjectsSuccess, loadProjectSuccess, loadProjectError, deleteProjectSuccess, createProjectSuccess } from './actions';
import { LOAD_PROJECTS_REQUEST, LOAD_PROJECT_REQUEST, DELETE_PROJECT_REQUEST } from './constants';

// Individual exports for testing
export function* loadProjectsSaga(action) {
  const queryParameters = (action.initialLoad
    ? {}
    : {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });

  try {
    const response = yield call(loadResources, 'project', queryParameters);

    yield put(mergeJsonApiResources(response));
    yield put(loadProjectsSuccess(response));
  } catch (e) {
    yield put(loadProjectsError(e.json.erros));
  }
}

// Individual exports for testing
export function* loadProjectSaga(action) {
  try {
    const response = yield call(loadResource, 'project', action.id);

    yield put(mergeJsonApiResources(response));
    yield put(loadProjectSuccess());
  } catch (e) {
    yield put(loadProjectError(e.json.errors));
  }
}

export function* createProjectSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
  };
  try {
    const response = yield call(createResource, 'project', data);

    yield put(mergeJsonApiResources(response));
    yield put(createProjectSuccess(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield success(e.json.errors);
  }
}

export function* createProjectFork(action, success, error) {
  yield fork(createProjectSaga(action, success, error));
}

export function* updateProjectSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
    slug: action.slug,
  };
  try {
    const response = yield call(updateResource, 'project', action.id, data);

    yield put(mergeJsonApiResources(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield error(e.json.errors);
  }
}

export function* updateProjectFork(action, success, error) {
  yield updateProjectSaga(action, success, error);
}

export function* deleteProjectSaga(action) {
  try {
    yield call(deleteResource, 'project', action.id);
    yield put(deleteProjectSuccess(action.id));
  } catch (e) {
    yield () => {};
  }
}

function* loadProjectsWatcher() {
  yield takeLatest(LOAD_PROJECTS_REQUEST, loadProjectsSaga);
}

function* loadProjectWatcher() {
  yield takeLatest(LOAD_PROJECT_REQUEST, loadProjectSaga);
}

function* deleteProjectWatcher() {
  yield takeLatest(DELETE_PROJECT_REQUEST, deleteProjectSaga);
}

export default {
  loadProjectsWatcher,
  loadProjectWatcher,
  deleteProjectWatcher,
};

