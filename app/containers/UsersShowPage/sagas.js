import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { userLoaded, userLoadError } from './actions';
import { LOAD_USER_REQUEST } from './constants';
import { fetchUser } from '../../api';

// Individual exports for testing
export function* getUser(action) {
  try {
    const userResponse = yield call(fetchUser, action.userId);
    yield put(userLoaded(userResponse));
  } catch (err) {
    yield put(userLoadError(err));
  }
}

export function* loadUser() {
  yield takeLatest(LOAD_USER_REQUEST, getUser);
}

// All sagas to be loaded
export default [
  loadUser,
];
