import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { saveSettingsSuccess, saveSettingsError } from './actions';
import { SAVE_SETTINGS_REQUEST } from './constants';
import { updateSettings } from '../../../api';
import { mergeJsonApiResources } from '../../../utils/resources/actions';

function* postSettings(action) {
  try {
    const { tenantId, body } = action;
    const response = yield call(updateSettings, tenantId, body);
    yield put(mergeJsonApiResources(response));
    yield put(saveSettingsSuccess(response));
  } catch (err) {
    yield put(saveSettingsError(err));
  }
}

export function* watchSaveSettings() {
  yield takeLatest(SAVE_SETTINGS_REQUEST, postSettings);
}
