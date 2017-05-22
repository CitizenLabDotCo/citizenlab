import { call, put, takeLatest, select } from 'redux-saga/effects';
import { storeJwt, loadCurrentUserRequest } from 'utils/auth/actions';
import { signInUser } from 'utils/auth/sagas';
import { socialLogin } from 'api';
import { setJwt } from 'utils/auth/jwt';
import { push } from 'react-router-redux';
import { goBackTo } from 'utils/store/actions';
import hello from 'hellojs';
import { AUTHENTICATE_SOCIAL_REQUEST } from './constants';
import { LOAD_CURRENT_USER_SUCCESS } from 'utils/auth/constants';
import { authenticateSocialError, authenticateSocialSuccess } from './actions';

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