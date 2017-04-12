import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import * as Api from 'api';
import { loadCurrentUserError, loadCurrentUserSuccess } from './actions';
import { LOAD_CURRENT_USER_REQUEST } from './constants';

export function* fetchCurrentUser() {
  try {
    const response = yield call(Api.fetchCurrentUser); // eslint-disable-line
    yield put(mergeJsonApiResources(response));
    yield put(loadCurrentUserSuccess(response));
  } catch (err) {
    yield put(loadCurrentUserError(err));
  }
}

export default function* authSaga() {
  yield takeLatest(LOAD_CURRENT_USER_REQUEST, fetchCurrentUser);
}
