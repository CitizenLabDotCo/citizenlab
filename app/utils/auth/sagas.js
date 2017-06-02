import { call, put, takeLatest, select } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import hello from 'hellojs';

import { makeSelectSetting } from 'utils/tenant/selectors';
import { fetchCurrentUser as fetchCurrentUserRequest, createUser as createUserRequest, login, socialLogin, socialRegister } from 'api';
import { removeJwt, setJwt } from './jwt';
import { loadCurrentUserError, loadCurrentUserSuccess, deleteCurrentUserLocal, storeJwt, createSocialUserSuccess,
createSocialUserError } from './actions';
import { LOAD_CURRENT_USER_REQUEST, SIGNOUT_CURRENT_USER, SIGNIN_USER_REQUEST, SOCIAL_AUTH_REQUEST } from './constants';

export function* fetchCurrentUser({ currentUser }) {
  try {
    let response = currentUser;
    if (!currentUser) {
      response = yield call(fetchCurrentUserRequest);
    }
    yield put(mergeJsonApiResources(response));
    yield put(loadCurrentUserSuccess(response));
  } catch (err) {
    yield put(loadCurrentUserError());
  }
}

export function* signOutUser() {
  removeJwt();
  yield put(deleteCurrentUserLocal());
}

export function* signInUser({ email, password, currentUser }, success, error) {
  try {
    const jwtResponse = yield call(login, email, password);
    yield put(storeJwt(jwtResponse.jwt));
    setJwt(jwtResponse.jwt);
    yield call(fetchCurrentUser, { currentUser });
    if (success) yield success();
  } catch (e) {
    if (error) yield error({ auth: [{ error: 'invalid' }] });
  }
}

export function* socialAuth(action) {
  const { network, locale } = action.payload;
  try {
    const appId = yield select(makeSelectSetting([`${network}_login`, 'app_id']));
    hello.init({ [network]: appId });
    const h = hello(network);
    const data = yield call([h, h.login], [{ scope: 'email' }]);
    if (action.register) {
      yield call(socialRegister, network, data.authResponse.access_token, locale);
    }
    // Yay! Registered! Now let's sign in :)
    const jwtResponse = yield call(socialLogin, network, data.authResponse.access_token);
    yield put(storeJwt(jwtResponse.jwt));
    setJwt(jwtResponse.jwt);
    // yield put(loadCurrentUserRequest());
    yield put(createSocialUserSuccess(network));
  } catch (err) {
    yield put(createSocialUserError(network, err));
  }
}

export function* createUser(data, success, error) {
  const { email, password } = data;
  try {
    const response = yield call(createUserRequest, data);
    yield call(signInUser, { email, password, response });
    if (success) yield success();
  } catch (e) {
    if (error) yield error(e.json.errors);
  }
}

function* authSagaWatcher() {
  yield takeLatest(LOAD_CURRENT_USER_REQUEST, fetchCurrentUser);
}

function* signOutSagaWatcher() {
  yield takeLatest(SIGNOUT_CURRENT_USER, signOutUser);
}

function* signInSagaWatcher() {
  yield takeLatest(SIGNIN_USER_REQUEST, signInUser);
}

export function* socialAuthSagaWatcher() {
  yield takeLatest(SOCIAL_AUTH_REQUEST, socialAuth);
}


export default { authSagaWatcher, signOutSagaWatcher, signInSagaWatcher, socialAuthSagaWatcher };
