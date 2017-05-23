import { call, put } from 'redux-saga/effects';
import { takeLatest, delay } from 'redux-saga';
import { getRecoveryLink } from 'api';
import { push } from 'react-router-redux';

import { SEND_RECOVERY_LINK_REQUEST } from './constants';
import { sendRecoveryLinkError, sendRecoveryLinkSuccess } from './actions';

// Individual exports for testing
export function* postResetLink(action) {
  try {
    yield call(getRecoveryLink, action.email);
    yield put(sendRecoveryLinkSuccess());
    yield call(delay, 3000);
    yield put(push('/sign-in'));
  } catch (err) {
    yield put(sendRecoveryLinkError());
  }
}

function* postResetLinkWatcher() {
  yield takeLatest(SEND_RECOVERY_LINK_REQUEST, postResetLink);
}

export default {
  postResetLinkWatcher,
};
