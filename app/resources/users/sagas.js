import { takeLatest, call, put } from 'redux-saga/effects';
import { loadResources, createResource, loadResource, deleteResource, updateResource } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { loadUsersError, loadUsersSuccess, loadUserSuccess, loadUserError, deleteUserSuccess, createUserSuccess } from './actions';
import { LOAD_USERS_REQUEST, LOAD_USER_REQUEST, DELETE_USER_REQUEST } from './constants';

// Individual exports for testing
export function* loadUsersSaga(action) {
  const queryParameters = (action.initialLoad
    ? {}
    : {
      'Page[number]': action.nextPageNumber,
      'Page[size]': action.nextPageItemCount,
    });

  try {
    const response = yield call(loadResources, 'user', queryParameters);

    yield put(mergeJsonApiResources(response));
    yield put(loadUsersSuccess(response));
  } catch (e) {
    yield put(loadUsersError(e.json.erros));
  }
}

// Individual exports for testing
export function* loadUserSaga(action) {
  try {
    const response = yield call(loadResource, 'user', action.id);

    yield put(mergeJsonApiResources(response));
    yield put(loadUserSuccess());
  } catch (e) {
    yield put(loadUserError(e.json.errors));
  }
}

export function* createUserSaga(action, success, error) {
  const data = {
    title_multiloc: action.title,
    description_multiloc: action.description,
  };
  try {
    const response = yield call(createResource, 'user', data);

    yield put(mergeJsonApiResources(response));
    yield put(createUserSuccess(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield success(e.json.errors);
  }
}

export function* createUserFork(action, success, error) {
  yield createUserSaga(action, success, error);
}

export function* updateUserSaga({ id, data }, success, error) {
  try {
    const response = yield call(updateResource, 'user', id, data);
      console.log(response)
    yield put(mergeJsonApiResources(response));
    if (success) yield success();
  } catch (e) {
    if (error) yield error(e.json.errors);
  }
}

export function* updateUserFork(data, success, error) {
  yield updateUserSaga(data, success, error);
}

export function* deleteUserSaga(action) {
  try {
    yield call(deleteResource, 'user', action.id);
    yield put(deleteUserSuccess(action.id));
  } catch (e) {
    yield () => {};
  }
}

function* loadUsersWatcher() {
  yield takeLatest(LOAD_USERS_REQUEST, loadUsersSaga);
}

function* loadUserWatcher() {
  yield takeLatest(LOAD_USER_REQUEST, loadUserSaga);
}

function* deleteUserWatcher() {
  yield takeLatest(DELETE_USER_REQUEST, deleteUserSaga);
}

export default {
  loadUsersWatcher,
  loadUserWatcher,
  deleteUserWatcher,
};

