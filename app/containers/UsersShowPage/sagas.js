import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { fetchIdeas, fetchUser } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';

import {
  loadUserError, loadUserIdeasError, loadUserIdeasSuccess, loadUserSuccess,
} from './actions';
import { LOAD_USER_IDEAS_REQUEST, LOAD_USER_REQUEST } from './constants';

// Individual exports for testing
export function* getUser(action) {
  try {
    const userResponse = yield call(fetchUser, action.userId);
    yield put(mergeJsonApiResources(userResponse));
    yield put(loadUserSuccess(userResponse));
  } catch (err) {
    yield put(loadUserError(JSON.stringify(err)));
  }
}

export function* getUserIdeas(action) {
  try {
    const userIdeasResponse = yield call(fetchIdeas, {
      author_id: action.userId,
    });
    yield put(mergeJsonApiResources(userIdeasResponse));
    yield put(loadUserIdeasSuccess(userIdeasResponse));
  } catch (err) {
    yield put(loadUserIdeasError(JSON.stringify(err)));
  }
}

export function* watchLoadUser() {
  yield takeLatest(LOAD_USER_REQUEST, getUser);
}

export function* watchLoadUserIdeas() {
  yield takeLatest(LOAD_USER_IDEAS_REQUEST, getUserIdeas);
}
