import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import Api from 'api';
import { loadCurrentTenantError, loadCurrentTenantSuccess } from './actions';
import { LOAD_CURRENT_TENANT_REQUEST } from './constants';

export function* fetchCurrentTenant() {
  try {
    const response = yield call(Api.fetchCurrentTenant); // eslint-disable-line
    yield put(mergeJsonApiResources(response));
    yield put(loadCurrentTenantSuccess(response));
  } catch (err) {
    yield put(loadCurrentTenantError(err));
  }
}

export function* defaultSaga() {
  yield takeLatest(LOAD_CURRENT_TENANT_REQUEST, fetchCurrentTenant);
}

// All sagas to be loaded
export default [
  defaultSaga,
];
