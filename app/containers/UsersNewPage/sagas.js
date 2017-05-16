import { call, put, takeLatest, select } from 'redux-saga/effects';
import { createUser, socialRegister, socialLogin } from 'api';
import { makeSelectSetting } from 'utils/tenant/selectors';
import { setJwt } from 'utils/auth/jwt';
import { storeJwt, loadCurrentUserRequest, signInUserRequest } from 'utils/auth/actions';
import { push } from 'react-router-redux';

import hello from 'hellojs';

import {
  CREATE_EMAIL_USER_REQUEST,
  CREATE_SOCIAL_USER_REQUEST,
} from './constants';
import {
  createEmailUserSuccess,
  createEmailUserError,
  createSocialUserSuccess,
  createSocialUserError,
} from './actions';

function* createEmailUser(action) {
  try {
    const response = yield call(createUser, action.payload);
    yield put(signInUserRequest(action.payload.email, action.payload.password, response));
    yield put(createEmailUserSuccess(response));
    yield put(push('/register/complete'));
  } catch (e) {
    yield put(createEmailUserError(e));
  }
}

function* createSocialUser(action) {
  const { network, locale } = action.payload;
  try {
    const appId = yield select(makeSelectSetting([`${network}_login`, 'app_id']));
    hello.init({ [network]: appId });
    const h = hello(network);
    const data = yield call([h, h.login], [{ scope: 'email' }]);
    yield call(socialRegister, network, data.authResponse.access_token, locale);

    // Yay! Registered! Now let's sign in :)
    const jwtResponse = yield call(socialLogin, network, data.authResponse.access_token);
    yield put(storeJwt(jwtResponse.jwt));
    setJwt(jwtResponse.jwt);
    yield put(loadCurrentUserRequest());
    yield put(createSocialUserSuccess(network));
  } catch (err) {
    yield put(createSocialUserError(network, err));
  }
}

export function* watchEmail() {
  yield takeLatest(CREATE_EMAIL_USER_REQUEST, createEmailUser);
}

export function* watchSocial() {
  yield takeLatest(CREATE_SOCIAL_USER_REQUEST, createSocialUser);
}
