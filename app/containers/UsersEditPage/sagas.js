import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import _ from 'lodash';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { fetchCurrentUser, updateCurrentUser } from 'api';

import {
  loadCurrentUserError, storeAvatarError, storeAvatarSuccess, updateCurrentUserError, updateCurrentUserSuccess, loadCurrentUserSuccess,
} from './actions';
import { STORE_AVATAR_REQUEST, UPDATE_CURRENT_USER_REQUEST } from './constants';
import { LOAD_CURRENT_USER } from '../App/constants';

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
    yield put(updateCurrentUserError());
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

function* watchLoadCurrentUser() {
  yield takeLatest(LOAD_CURRENT_USER, getProfile);
}

function* watchStoreAvatar() {
  yield takeLatest(STORE_AVATAR_REQUEST, postAvatar);
}

function* watchStoreCurrentUser() {
  yield takeLatest(UPDATE_CURRENT_USER_REQUEST, postProfile);
}

export default {
  watchLoadCurrentUser,
  watchStoreAvatar,
  watchStoreCurrentUser,
};
