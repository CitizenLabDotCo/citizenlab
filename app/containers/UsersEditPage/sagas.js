import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';

import {
  currentUserLoadError, currentUserLoaded, currentUserUpdated, storeCurrentUserError,
} from './actions';
import { STORE_CURRENT_USER } from './constants';
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
  try {console.log(updateCurrentUser(action.payload));
    const currentUserResponse = yield call(updateCurrentUser(action.payload));

    yield put(mergeJsonApiResources(currentUserResponse));
    yield put(currentUserUpdated(currentUserResponse));
  } catch (err) {
    yield put(storeCurrentUserError());
  }
}

export function* storeCurrentUser() {
  yield takeLatest(STORE_CURRENT_USER, postProfile);
}

export function* loadCurrentUser() {
  yield takeLatest(LOAD_CURRENT_USER, getProfile);
}

// All sagas to be loaded
export default [
  loadCurrentUser,
  storeCurrentUser,
];
