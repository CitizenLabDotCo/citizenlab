import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { resetPassword } from 'api';

import { RESET_PASSWORD_REQUEST } from './constants';
import { resetPasswordError, resetPasswordSuccess } from './actions';

// Individual exports for testing
export function* postResetPassword(action) {
  try {
    yield call(resetPassword, action.password, action.token);
    yield put(resetPasswordSuccess());
    // yield call(delay, 3000);
    // yield put(push('/sign-in'));
  } catch (err) {
    yield put(resetPasswordError());
  }
}

function* postResetPasswordWatcher() {
  yield takeLatest(RESET_PASSWORD_REQUEST, postResetPassword);
}

export default {
  postResetPasswordWatcher,
};
