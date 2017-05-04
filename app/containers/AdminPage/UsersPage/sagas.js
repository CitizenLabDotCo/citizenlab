/*
 *
 * UsersPage sagas
 *
 */

import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { usersLoaded, usersLoadError } from './actions';
import { LOAD_USERS_REQUEST } from './constants';
import { fetchUsers } from '../../../api';
import { mergeJsonApiResources } from '../../../utils/resources/actions';

function* getUsers(action) {
  try {
    const pageCount = action.pageCount;
    const usersResponse = yield call(fetchUsers, {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });

    yield put(mergeJsonApiResources(usersResponse));
    yield put(usersLoaded(usersResponse, pageCount));
  } catch (err) {
    yield put(usersLoadError(err));
  }
}

function* watchLoadUsers() {
  yield takeLatest(LOAD_USERS_REQUEST, getUsers);
}

export default [
  watchLoadUsers,
];
