import { call, put, takeLatest } from 'redux-saga/effects';
import * as Api from 'api';
import {
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  CREATE_USER_ERROR,
} from './constants';
import { authenticateEmailRequest } from '../SignInPage/actions';
import { AUTHENTICATE_EMAIL_REQUEST } from '../SignInPage/constants';
import { fetchJwt } from '../SignInPage/sagas';


export function* createUser(action) {
  try {
    const json = yield call(Api.createUser, action.payload); // eslint-disable-line
    yield put({ type: CREATE_USER_SUCCESS, payload: json });

    // automatically sign in by passing in username and password
    const credentials = {
      email: action.payload.email,
      password: action.payload.password,
    };

    yield put(authenticateEmailRequest(credentials));
  } catch (e) {
    yield put({ type: CREATE_USER_ERROR, payload: e, error: true });
  }
}

export function* watchCreateUser() {
  yield takeLatest(CREATE_USER_REQUEST, createUser);
}

export function* watchUserSignIn() {
  yield takeLatest(AUTHENTICATE_EMAIL_REQUEST, fetchJwt);
}
