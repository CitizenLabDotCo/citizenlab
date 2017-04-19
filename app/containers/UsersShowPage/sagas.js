import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { userIdeasLoaded, userIdeasLoadError, userLoaded, userLoadError } from './actions';
import { LOAD_USER_IDEAS_REQUEST, LOAD_USER_REQUEST } from './constants';
import { fetchIdeas, fetchUser } from '../../api';
import { mergeJsonApiResources } from '../../utils/resources/actions';

// Individual exports for testing
export function* getUser(action) {
  try {
    const userResponse = yield call(fetchUser, action.userId);
    yield put(mergeJsonApiResources(userResponse));
    yield put(userLoaded(userResponse));
  } catch (err) {
    yield put(userLoadError(err));
  }
}

export function* getUserIdeas(action) {
  try {
    const userIdeasResponse = yield call(fetchIdeas, {
      author: action.userId,
    });
    yield put(mergeJsonApiResources(userIdeasResponse));
    yield put(userIdeasLoaded(userIdeasResponse));
  } catch (err) {
    yield put(userIdeasLoadError(err));
  }
}

export function* watchLoadUser() {
  yield takeLatest(LOAD_USER_REQUEST, getUser);
}

export function* watchLoadUserIdeas() {
  yield takeLatest(LOAD_USER_IDEAS_REQUEST, getUserIdeas);
}
