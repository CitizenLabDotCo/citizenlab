import { call, put, takeLatest } from 'redux-saga/effects';
import { storeJwt, loadCurrentUserRequest } from 'utils/auth/actions';
import * as Api from 'api';
import { setJwt } from 'utils/request';
import { push } from 'react-router-redux';
import { AUTHENTICATE_REQUEST } from './constants';
import { authenticateError } from './actions';

export function* fetchJwt(action) {
  try {
    const jwtResponse = yield call(Api.login, action.payload.email, action.payload.password); // eslint-disable-line
    yield put(storeJwt(jwtResponse.jwt));
    setJwt(jwtResponse.jwt);
    yield put(loadCurrentUserRequest());
    yield put(push('/ideas'));
  } catch (err) {
    yield put(authenticateError(err));
  }
}

export function* defaultSaga() {
  yield takeLatest(AUTHENTICATE_REQUEST, fetchJwt);
}

// All sagas to be loaded
export default [
  defaultSaga,
];
