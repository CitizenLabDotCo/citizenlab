import { call, put, takeLatest } from 'redux-saga/effects';
import Api from 'api';
import {
  CREATE_USER_PENDING,
  CREATE_USER_FULFILLED,
  CREATE_USER_REJECTED,
} from './constants';


export function* createUser(action) {
  try {
    const json = yield call(Api.createUser, action.payload); // eslint-disable-line
    yield put({ type: CREATE_USER_FULFILLED, payload: json });
  } catch (e) {
    yield put({ type: CREATE_USER_REJECTED, payload: e, error: true });
  }
}

function* watchCreateUser() {
  yield takeLatest(CREATE_USER_PENDING, createUser);
}

export default [
  watchCreateUser,
];
