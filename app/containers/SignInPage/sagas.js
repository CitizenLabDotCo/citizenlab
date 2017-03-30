import { call, put, takeLatest } from 'redux-saga/effects';
import { storeJwt, loadCurrentUserRequest } from 'utils/auth/actions';
import Api from 'api';
import { AUTHENTICATE_REQUEST } from './constants';
import { authenticateError } from './actions';

export function* fetchJwt(action) {
  try {
    const jwtResponse = yield call(Api.login, action.payload.email, action.payload.password); // eslint-disable-line
    yield put(storeJwt(jwtResponse.jwt));
    // window.localStorage.set('jwt', jwtResponse.jwt);
    yield put(loadCurrentUserRequest());
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
