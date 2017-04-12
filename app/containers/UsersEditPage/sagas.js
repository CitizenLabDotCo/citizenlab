import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import _ from 'lodash';

import {
  currentUserLoadError, currentUserLoaded, currentUserUpdated, storeCurrentUserError,
  avatarStoreError, avatarStored,
} from './actions';
import { STORE_AVATAR, STORE_CURRENT_USER } from './constants';
import { mergeJsonApiResources } from '../../utils/resources/actions';
import { fetchCurrentUser, updateCurrentUser } from '../../api';
import { LOAD_CURRENT_USER } from '../App/constants';

// Individual exports for testing
export function* getProfile() {
  try {
    const currentUserResponse = yield call(fetchCurrentUser);
    yield put(mergeJsonApiResources(currentUserResponse));
    yield put(currentUserLoaded(currentUserResponse));
  } catch (err) {
    yield put(currentUserLoadError(err));
  }
}

export function* postProfile(action) {
  try {
    // create request body not containing avatar and userId;
    const payload = _.omit(action.payload, ['avatar', 'userId']);

    const userId = action.userId;

    const currentUserResponse = yield call(updateCurrentUser, payload, userId);

    yield put(mergeJsonApiResources(currentUserResponse));
    yield put(currentUserUpdated(currentUserResponse));
  } catch (err) {
    yield put(storeCurrentUserError());
  }
}

export function* postAvatar(action) {
  try {
    // create request body containing avatar only
    const payload = {
      avatar: action.avatarBase64,
    };

    const userId = action.userId;

    yield call(updateCurrentUser, payload, userId);

    yield put(avatarStored());
  } catch (err) {
    yield put(avatarStoreError());
  }
}

export function* storeCurrentUser() {
  yield takeLatest(STORE_CURRENT_USER, postProfile);
}

export function* storeAvatar() {
  yield takeLatest(STORE_AVATAR, postAvatar);
}

export function* loadCurrentUser() {
  yield takeLatest(LOAD_CURRENT_USER, getProfile);
}

// All sagas to be loaded
export default [
  loadCurrentUser,
  storeCurrentUser,
  storeAvatar,
];
