import { call, put, takeLatest, select } from 'redux-saga/effects';
import { storeJwt, loadCurrentUserRequest } from 'utils/auth/actions';
import { login, socialLogin } from 'api';
import { setJwt } from 'utils/request';
import { makeSelectSetting } from 'utils/tenant/selectors';
import { push } from 'react-router-redux';
import hello from 'hellojs';
import { AUTHENTICATE_EMAIL_REQUEST, AUTHENTICATE_SOCIAL_REQUEST } from './constants';
import { authenticateEmailError, authenticateEmailSuccess, authenticateSocialError, authenticateSocialSuccess } from './actions';

export function* fetchJwt(action) {
  try {
    const jwtResponse = yield call(login, action.payload.email, action.payload.password);
    yield put(storeJwt(jwtResponse.jwt));
    setJwt(jwtResponse.jwt);
    yield put(loadCurrentUserRequest());
    yield put(authenticateEmailSuccess());
    yield put(push('/ideas'));
  } catch (err) {
    yield put(authenticateEmailError(err));
  }
}

function* authSocial(action) {
  const network = action.payload;
  try {
    const appId = yield select(makeSelectSetting([`${network}_login`, 'app_id']));
    hello.init({ [network]: appId });
    const h = hello(network);
    const data = yield call([h, h.login], [{ scope: 'email' }]);
    const jwtResponse = yield call(socialLogin, network, data.authResponse.access_token);
    yield put(storeJwt(jwtResponse.jwt));
    setJwt(jwtResponse.jwt);
    yield put(loadCurrentUserRequest());
    yield put(authenticateSocialSuccess(network));
  } catch (err) {
    yield put(authenticateSocialError(network, err));
  }
}

export function* emailSaga() {
  yield takeLatest(AUTHENTICATE_EMAIL_REQUEST, fetchJwt);
}

export function* socialSaga() {
  yield takeLatest(AUTHENTICATE_SOCIAL_REQUEST, authSocial);
}
