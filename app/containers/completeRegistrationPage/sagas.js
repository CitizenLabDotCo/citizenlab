import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { updateCurrentUser } from 'api';

import { updateCurrentUserError, updateCurrentUserSuccess } from './actions';
import { UPDATE_CURRENT_USER_REQUEST } from './constants';

export function* updateUser(action) {
  try {
    const { field, value, userId } = action;
    const payload = { [field]: value };

    const currentUserResponse = yield call(updateCurrentUser, payload, userId);

    yield put(mergeJsonApiResources(currentUserResponse));
    yield put(updateCurrentUserSuccess(field));
    if (action.callback) {
      yield call(action.callback);
    }
  } catch (err) {
    yield put(updateCurrentUserError(err));
  }
}

function* updateUserWatcher() {
  yield takeLatest(UPDATE_CURRENT_USER_REQUEST, updateUser);
}

export default { updateUserWatcher };
