import request from 'utils/request';
import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';

import {
  profileLoadError, profileLoaded, profileStored, storeProfileError, avatarStored,
  storeAvatarError, avatarLoaded, loadAvatarError,
} from './actions';
import { LOAD_AVATAR, LOAD_PROFILE, STORE_AVATAR, STORE_PROFILE } from './constants';

// Individual exports for testing
export function* getProfile() {
  const requestURL = 'http://demo9193680.mockable.io/profile-get';

  try {
    const profile = yield call(request, requestURL);

    yield put(profileLoaded(profile));
  } catch (err) {
    yield put(profileLoadError(err));
  }
}

export function* postProfile(action) {
  const requestURL = 'http://demo9193680.mockable.io/profile-post';

  try {
    const response = yield call(request, requestURL, {
      method: 'POST',
      body: JSON.stringify(action.userData),
    });

    yield put(profileStored(response, action.userData));
  } catch (err) {
    yield put(storeProfileError(action.userData));
  }
}

export function* getAvatar() {
  const requestURL = 'http://demo9193680.mockable.io/avatar-get';

  try {
    const response = yield call(request, requestURL);

    yield put(avatarLoaded(response.avatar));
  } catch (err) {
    yield put(loadAvatarError(err));
  }
}

export function* postAvatar(action) {
  const requestURL = 'http://demo9193680.mockable.io/avatar-post';

  try {
    const response = yield call(request, requestURL, {
      method: 'POST',
      body: JSON.stringify(action.avatar),
    });

    yield put(avatarStored(response.avatar));
  } catch (err) {
    yield put(storeAvatarError(err));
  }
}

export function* storeProfile() {
  yield takeLatest(STORE_PROFILE, postProfile);
}

export function* loadProfile() {
  yield takeLatest(LOAD_PROFILE, getProfile);
}

export function* storeAvatar() {
  yield takeLatest(STORE_AVATAR, postAvatar);
}

export function* loadAvatar() {
  yield takeLatest(LOAD_AVATAR, getAvatar);
}

// All sagas to be loaded
export default [
  loadProfile,
  storeProfile,
  storeAvatar,
  loadAvatar,
];
