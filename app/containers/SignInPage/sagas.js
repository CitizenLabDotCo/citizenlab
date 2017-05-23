import { call, put, takeLatest, select } from 'redux-saga/effects';
import { signInUser } from 'utils/auth/sagas';
import { push } from 'react-router-redux';
import { goBackTo } from 'utils/store/actions';
import { LOAD_CURRENT_USER_SUCCESS } from 'utils/auth/constants';

export function* signInUserSuccess(action) {
  yield call(signInUser, action.payload);
  const goBackToLink = yield select((state) => state.getIn(['goBackLink', 'code']));
  if (goBackToLink) {
    yield put(goBackTo(goBackToLink));
  } else {
    yield put(push('/'));
  }
}

export function* signInUserSuccessWatcher() {
  yield takeLatest(LOAD_CURRENT_USER_SUCCESS, signInUserSuccess);
}
