import { call, put, takeLatest } from 'redux-saga/effects';
import * as Api from 'api';
import {
  CREATE_USER_PENDING,
  CREATE_USER_FULFILLED,
  CREATE_USER_REJECTED,
} from './constants';
import { authenticateRequest } from '../SignInPage/actions';
import { AUTHENTICATE_REQUEST } from '../SignInPage/constants';
import { fetchJwt } from '../SignInPage/sagas';


export function* createUser(action) {
  try {
    const json = yield call(Api.createUser, action.payload); // eslint-disable-line
    yield put({ type: CREATE_USER_FULFILLED, payload: json });

    // automatically sign in by passing in username and password
    const credentials = {
      email: action.payload.email,
      password: action.payload.password,
    };

    yield put(authenticateRequest(credentials));
  } catch (e) {
    yield put({ type: CREATE_USER_REJECTED, payload: e, error: true });
  }
}

function* watchCreateUser() {
  yield takeLatest(CREATE_USER_PENDING, createUser);
}

export function* watchUserSignIn() {
  yield takeLatest(AUTHENTICATE_REQUEST, fetchJwt);
}

export default [
  watchCreateUser,
  watchUserSignIn,
];
