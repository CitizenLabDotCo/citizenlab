import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { fetchCurrentUser as fetchCurrentUserRequest, login } from 'api';
//import { push } from 'react-router-redux';
import { removeJwt, setJwt } from './jwt';
import { loadCurrentUserRequest, loadCurrentUserError, loadCurrentUserSuccess, deleteCurrentUserLocal, storeJwt } from './actions';
import { LOAD_CURRENT_USER_REQUEST, SIGNOUT_CURRENT_USER, SIGNIN_USER_REQUEST } from './constants';


export function* fetchCurrentUser({ currentUser }) {
  try {
    let response = currentUser;
    if (!currentUser) {
      response = yield call(fetchCurrentUserRequest);
    }
    yield put(mergeJsonApiResources(response));
    yield put(loadCurrentUserSuccess(response));
  } catch (err) {
    yield put(loadCurrentUserError(err));
  }
}

export function* signOutUser() {
  removeJwt();
  yield put(deleteCurrentUserLocal());
}

export function* signInUser({ email, password, currentUser }) {
  const jwtResponse = yield call(login, email, password);
  yield put(storeJwt(jwtResponse.jwt));
  setJwt(jwtResponse.jwt);
  yield put(loadCurrentUserRequest(currentUser));
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

export default { authSagaWatcher, signOutSagaWatcher, signInSagaWatcher };
