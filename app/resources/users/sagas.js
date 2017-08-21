import { takeLatest, call, put } from 'redux-saga/effects';
import { loadResources, createResource, deleteResource, updateResource, fetchUser, fetchUserBySlug } from 'api';
import { mergeJsonApiResources, wrapActionWithPrefix } from 'utils/resources/actions';
import { loadUsersError, loadUsersSuccess, loadUserSuccess, loadUserError, deleteUserSuccess, createUserSuccess } from './actions';
import { LOAD_USERS_REQUEST, LOAD_USER_REQUEST, LOAD_USER_BY_SLUG_REQUEST, DELETE_USER_REQUEST } from './constants';

// Individual exports for testing
export function* loadUsersSaga(action) {
  const queryParameters = action.queryParams;

  try {
    const response = yield call(loadResources, 'user', queryParameters);

    yield put(mergeJsonApiResources(response));
    yield put(wrapActionWithPrefix(loadUsersSuccess, action.actionPrefix)(response));
  } catch (e) {
    yield put(wrapActionWithPrefix(loadUsersError, action.actionPrefix)(e.json.erros));
  }
}

// Individual exports for testing
export function* loadUserSaga(action) {
  try {
    let response;
    if (action.slug) {
      response = yield call(fetchUserBySlug, action.slug);
    } else {
      response = yield call(fetchUser, action.id);
    }

    yield put(mergeJsonApiResources(response));
    yield put(wrapActionWithPrefix(loadUserSuccess, action.actionPrefix)());
  } catch (e) {
    yield put(wrapActionWithPrefix(loadUserError, action.actionPrefix)(e.json.errors));
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
    yield put(wrapActionWithPrefix(createUserSuccess, action.actionPrefix)(response));
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
    yield put(wrapActionWithPrefix(deleteUserSuccess, action.actionPrefix)(action.id));
  } catch (e) {
    yield () => {};
  }
}

export function* loadUsersWatcher(actionPrefix = '') {
  yield takeLatest(actionPrefix + LOAD_USERS_REQUEST, loadUsersSaga);
}

export function* loadUserWatcher(actionPrefix = '') {
  yield takeLatest([actionPrefix + LOAD_USER_REQUEST, LOAD_USER_BY_SLUG_REQUEST], loadUserSaga);
}

export function* deleteUserWatcher(actionPrefix = '') {
  yield takeLatest(actionPrefix + DELETE_USER_REQUEST, deleteUserSaga);
}

export default {
  loadUsersWatcher,
  loadUserWatcher,
  deleteUserWatcher,
};
