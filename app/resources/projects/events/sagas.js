import { takeLatest, call, put } from 'redux-saga/effects';
import { fetchProjectEvents } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import {
  loadProjectEventsSuccess, loadProjectEventsError,
} from './actions';
import {
  LOAD_PROJECT_EVENTS_REQUEST,
} from './constants';

// Individual exports for testing
export function* loadProjectEventsSaga(action) {
  try {
    const response = yield call(fetchProjectEvents, action.payload);

    yield put(mergeJsonApiResources(response));
    yield put(loadProjectEventsSuccess(response));
  } catch (e) {
    yield put(loadProjectEventsError(e.json.errors));
  }
}

function* loadProjectEventsWatcher() {
  yield takeLatest(LOAD_PROJECT_EVENTS_REQUEST, loadProjectEventsSaga);
}

export default {
  loadProjectEventsWatcher,
};

