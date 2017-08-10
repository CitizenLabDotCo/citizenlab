import { call, select } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { makeSelectCurrentTenant } from 'utils/tenant/selectors';
import { LOCATION_CHANGE } from 'react-router-redux';
import { LOAD_CURRENT_USER_SUCCESS } from 'utils/auth/constants';
import { UPDATE_CURRENT_USER_SUCCESS } from 'containers/UsersEditPage/constants';
import { addTenantInfo } from './';

const selectCurrentTenant = makeSelectCurrentTenant();

function* trackAction(action) {
  const tenant = yield select(selectCurrentTenant);
  yield call(
    window.analytics.track,
    action.meta.track.name,
    addTenantInfo(action.meta.track.properties, tenant),
  );
}

function* trackPageChange(action) {
  const tenant = yield select(selectCurrentTenant);
  yield call(
    window.analytics.page,
    action.payload.pathname,
    addTenantInfo({}, tenant),
  );
}

function* trackIdentification(action) {
  const tenant = yield select(selectCurrentTenant);
  const user = action.payload.data;
  yield call(
    window.analytics.identify,
    user.id,
    addTenantInfo({
      email: user.attributes.email,
      firstName: user.attributes.first_name,
      lastName: user.attributes.last_name,
      createdAt: user.attributes.created_at,
      avatar: user.attributes.avatar.large,
      birthday: user.attributes.birtyyear,
      gender: user.attributes.gender,
    }, tenant),
  );
}

function isTrackableAction(action) {
  return action && action.meta && action.meta.track;
}

export function* watchEvents() {
  yield takeLatest(isTrackableAction, trackAction);
}

export function* watchPageChanges() {
  yield takeLatest(LOCATION_CHANGE, trackPageChange);
}

export function* watchIdentification() {
  yield takeLatest([LOAD_CURRENT_USER_SUCCESS, UPDATE_CURRENT_USER_SUCCESS], trackIdentification);
}
