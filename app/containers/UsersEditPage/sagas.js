import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import _ from 'lodash';

import {
  loadCurrentUserError, storeAvatarError, storeAvatarSuccess, storeCurrentUserError, updateCurrentUserSuccess,
} from './actions';
import { STORE_AVATAR, UPDATE_CURRENT_USER } from './constants';
import { mergeJsonApiResources } from '../../utils/resources/actions';
import { fetchCurrentUser, updateCurrentUser } from '../../api';
import { LOAD_CURRENT_USER } from '../App/constants';
import { loadCurrentUserSuccess } from '../../utils/auth/actions';

// Individual exports for testing
export function* getProfile() {
  try {
    const currentUserResponse = yield call(fetchCurrentUser);
    yield put(mergeJsonApiResources(currentUserResponse));
    yield put(loadCurrentUserSuccess(currentUserResponse));
  } catch (err) {
    yield put(loadCurrentUserError(err));
  }
}

export function* postProfile(action) {
  try {
    // create request body not containing avatar and userId;
    const payload = _.omit(action.payload, ['avatar', 'userId']);

    const userId = action.userId;

    const currentUserResponse = yield call(updateCurrentUser, payload, userId);

    yield put(mergeJsonApiResources(currentUserResponse));
    yield put(updateCurrentUserSuccess(currentUserResponse));
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

    yield put(storeAvatarSuccess());
  } catch (err) {
    yield put(storeAvatarError());
  }
}

export function* watchLoadCurrentUser() {
  yield takeLatest(LOAD_CURRENT_USER, getProfile);
}

export function* watchStoreAvatar() {
  yield takeLatest(STORE_AVATAR, postAvatar);
}

export function* watchStoreCurrentUser() {
  yield takeLatest(UPDATE_CURRENT_USER, postProfile);
}
