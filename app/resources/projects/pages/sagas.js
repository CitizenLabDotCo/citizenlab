import { takeLatest, call, put } from 'redux-saga/effects';
import { fetchPages } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import {
  loadProjectPagesSuccess, loadProjectPagesError,
} from './actions';
import {
  LOAD_PROJECT_PAGES_REQUEST,
} from './constants';

// Individual exports for testing
export function* loadProjectPagesSaga(action) {
  try {
    const response = yield call(fetchPages, {
      'page[number]': 1,
      'page[size]': 3,
      project: action.payload,
    });

    yield put(mergeJsonApiResources(response));
    yield put(loadProjectPagesSuccess(response));
  } catch (e) {
    yield put(loadProjectPagesError(e.json.errors));
  }
}

function* loadProjectPagesWatcher() {
  yield takeLatest(LOAD_PROJECT_PAGES_REQUEST, loadProjectPagesSaga);
}

export default {
  loadProjectPagesWatcher,
};

