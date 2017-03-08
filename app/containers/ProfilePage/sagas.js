import request from 'utils/request';
import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';

import { profileLoadError, profileLoaded } from './actions';
import { LOAD_PROFILE } from './constants';

// Individual exports for testing
export function* getProfile() {
  const requestURL = 'http://localhost:3030/profile';

  try {
    const profile = yield call(request, requestURL);

    yield put(profileLoaded(profile));
  } catch (err) {
    // console.log(err);
    yield put(profileLoadError(err));
  }
}

export function* storeProfile() {
  // TODO (based on userInformation())
}

export function* userInformation() {
  yield takeLatest(LOAD_PROFILE, getProfile);
}

// All sagas to be loaded
export default [
  userInformation,
];
