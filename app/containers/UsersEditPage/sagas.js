import request from 'utils/request';
import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';

import { profileLoadError, profileLoaded, profileStored, storeProfileError } from './actions';
import { LOAD_PROFILE, STORE_PROFILE } from './constants';

// Individual exports for testing
export function* getProfile() {
  const requestURL = 'http://localhost:3030/profile-get';

  try {
    const profile = yield call(request, requestURL);

    yield put(profileLoaded(profile));
  } catch (err) {
    yield put(profileLoadError(err));
  }
}

export function* postProfile(action) {
  const requestURL = 'http://localhost:3030/profile-post';

  try {
    const response = yield call(request, requestURL, {
      method: 'POST',
      body: JSON.stringify(action.userData),
    });

    yield put(profileStored(response, action.userData));
  } catch (err) {
    yield put(storeProfileError(err, action.userData));
  }
}

export function* storeProfile() {
  yield takeLatest(STORE_PROFILE, postProfile);
}

export function* loadProfile() {
  yield takeLatest(LOAD_PROFILE, getProfile);
}

// All sagas to be loaded
export default [
  loadProfile,
  storeProfile,
];
