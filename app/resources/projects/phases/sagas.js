import { takeLatest, call, put } from 'redux-saga/effects';
import { fetchProjectPhases } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import {
  loadProjectPhasesSuccess, loadProjectPhasesError,
} from './actions';
import {
  LOAD_PROJECT_PHASES_REQUEST,
} from './constants';

// Individual exports for testing
export function* loadProjectPhasesSaga(action) {
  try {
    const response = yield call(fetchProjectPhases, action.payload);

    yield put(mergeJsonApiResources(response));
    yield put(loadProjectPhasesSuccess(response));
  } catch (e) {
    yield put(loadProjectPhasesError(e.json.errors));
  }
}

function* loadProjectPhasesWatcher() {
  yield takeLatest(LOAD_PROJECT_PHASES_REQUEST, loadProjectPhasesSaga);
}

export default {
  loadProjectPhasesWatcher,
};

