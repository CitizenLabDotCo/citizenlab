import { takeLatest, call, put, fork } from 'redux-saga/effects';
import { loadResources, createResource, loadResource, deleteResource, updateResource } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { loadIdeasError, loadIdeasSuccess, loadIdeaSuccess, loadIdeaError, deleteIdeaSuccess, createIdeaSuccess } from './actions';
import { LOAD_IDEAS_REQUEST, LOAD_IDEA_REQUEST, DELETE_IDEA_REQUEST } from './constants';

// Individual exports for testing
export function* loadIdeasSaga(action) {
  const queryParameters = (action.initialLoad
    ? {}
    : {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });

  try {
    const response = yield call(loadResources, 'idea', queryParameters);

    yield put(mergeJsonApiResources(response));
    yield put(loadIdeasSuccess(response));
  } catch (e) {
    yield put(loadIdeasError(e.json.erros));
  }
}

// Individual exports for testing
export function* loadIdeaSaga(action) {
  try {
    const response = yield call(loadResource, 'idea', action.id);

    yield put(mergeJsonApiResources(response));
    yield put(loadIdeaSuccess());
  } catch (e) {
    yield put(loadIdeaError(e.json.errors));
  }
}

export function* loadIdeaSagaFork(action, success, error) {
  yield fork(loadIdeaSaga, action, success, error);
}

// Individual exports for testing
export function* createIdeasVoteSaga(action, success, error) {
  try {
    const response = yield call(createResource, 'vote', action, 'ideas', action.id, 'votes');
    yield put(mergeJsonApiResources(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield error();
  }
}

export function* createIdeasVoteSagaFork(action, success, error) {
  yield fork(createIdeasVoteSaga, action, success, error);
}

export function* deleteIdeasVoteSaga(action, success, error) {
  try {
    const response = yield call(deleteResource, 'vote', action.id);
    yield put(mergeJsonApiResources(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield error();
  }
}

export function* deleteIdeasVoteSagaFork(action, success, error) {
  yield fork(deleteIdeasVoteSaga, action, success, error);
}

export function* createIdeaSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
  };
  try {
    const response = yield call(createResource, 'idea', data);

    yield put(mergeJsonApiResources(response));
    yield put(createIdeaSuccess(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield success(e.json.errors);
  }
}

export function* createIdeaFork(action, success, error) {
  yield createIdeaSaga(action, success, error);
}

export function* updateIdeaSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
    slug: action.slug,
  };
  try {
    const response = yield call(updateResource, 'idea', action.id, data);

    yield put(mergeJsonApiResources(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield error(e.json.errors);
  }
}

export function* updateIdeaFork(action, success, error) {
  yield updateIdeaSaga(action, success, error);
}

export function* deleteIdeaSaga(action) {
  try {
    yield call(deleteResource, 'idea', action.id);
    yield put(deleteIdeaSuccess(action.id));
  } catch (e) {
    yield () => {};
  }
}

function* loadIdeasWatcher() {
  yield takeLatest(LOAD_IDEAS_REQUEST, loadIdeasSaga);
}

function* loadIdeaWatcher() {
  yield takeLatest(LOAD_IDEA_REQUEST, loadIdeaSaga);
}

function* deleteIdeaWatcher() {
  yield takeLatest(DELETE_IDEA_REQUEST, deleteIdeaSaga);
}

export default {
  loadIdeasWatcher,
  loadIdeaWatcher,
  deleteIdeaWatcher,
};

