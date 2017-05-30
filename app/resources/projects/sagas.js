import { takeLatest, call, put } from 'redux-saga/effects';
import { fetchProjects, createProject, fetchProject, deleteProject, updateProject } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { loadProjectsError, loadProjectsSuccess, loadProjectSuccess, loadProjectError, deleteProjectSuccess, publishProjectSuccess } from './actions';
import { LOAD_PROJECTS_REQUEST, LOAD_PROJECT_REQUEST, DELETE_PROJECT_REQUEST } from './constants';

// Individual exports for testing
export function* getProjects(action) {
  const queryParameters = (action.initialLoad
    ? {}
    : {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });

  try {
    const response = yield call(fetchProjects, queryParameters);

    yield put(mergeJsonApiResources(response));
    yield put(loadProjectsSuccess(response));
  } catch (e) {
    yield put(loadProjectsError(e.json.erros));
  }
}

// Individual exports for testing
export function* fetchProjectSaga(action) {
  try {
    const response = yield call(fetchProject, action.id);

    yield put(mergeJsonApiResources(response));
    yield put(loadProjectSuccess());
  } catch (e) {
    yield put(loadProjectError(e.json.erros));
  }
}

export function* publishProjectSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
  };
  try {
    const response = yield call(createProject, data);

    yield put(mergeJsonApiResources(response));
    yield put(publishProjectSuccess(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield success(e.json.erros);
  }
}

export function* publishProjectFork(action, success, error) {
  yield publishProjectSaga(action, success, error);
}

export function* updateProjectSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
    slug: action.slug,
  };
  try {
    const response = yield call(updateProject, action.id, data);

    yield put(mergeJsonApiResources(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield error(e.json.erros);
  }
}

export function* updateProjectFork(action, success, error) {
  yield updateProjectSaga(action, success, error);
}

export function* deleteProjectSaga(action) {
  try {
    yield call(deleteProject, action.id);
    yield put(deleteProjectSuccess(action.id));
  } catch (e) {
    yield () => {};
  }
}

function* fetchProjectsWatcher() {
  yield takeLatest(LOAD_PROJECTS_REQUEST, getProjects);
}

function* fetchProjectWatcher() {
  yield takeLatest(LOAD_PROJECT_REQUEST, fetchProjectSaga);
}

function* deleteProjectWatcher() {
  yield takeLatest(DELETE_PROJECT_REQUEST, deleteProjectSaga);
}

export default {
  fetchProjectsWatcher,
  fetchProjectWatcher,
  deleteProjectWatcher,
};

