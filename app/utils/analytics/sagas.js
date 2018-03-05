import { call } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { LOCATION_CHANGE } from 'react-router-redux';
import { LOAD_CURRENT_USER_SUCCESS } from 'utils/auth/constants';
import { trackIdentification, trackPage, trackEvent } from './';
import { find } from 'lodash';

function* trackAction(action) {
  yield call(
    trackEvent,
    action.meta.track.name,
    action.meta.track.properties,
  );
}

function* trackPageChange(action) {
  yield call(
    trackPage,
    action.payload.pathname,
    {},
  );
}

function* trackIdentifications(action) {
  const user = action.payload.data;
  yield call(
    trackIdentification,
    user.id,
    {
      email: user.attributes.email,
      firstName: user.attributes.first_name,
      lastName: user.attributes.last_name,
      createdAt: user.attributes.created_at,
      avatar: user.attributes.avatar.large,
      birthday: user.attributes.birthyear,
      gender: user.attributes.gender,
      locale: user.attributes.locale,
      isAdmin: !!find(user.attributes.roles, { type: 'admin' }),
    }
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
  yield takeLatest([LOAD_CURRENT_USER_SUCCESS], trackIdentifications);
}
