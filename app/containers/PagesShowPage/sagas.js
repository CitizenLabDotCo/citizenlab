import { takeLatest, call, put } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { fetchPage } from 'api';

import { LOAD_PAGE_REQUEST } from './constants';
import { loadPageError, loadPageSuccess } from './actions';

export function* getPage(action) {
  try {
    const response = yield call(fetchPage, action.payload);
    yield put(mergeJsonApiResources(response));
    yield put(loadPageSuccess(response));
  } catch (err) {
    yield put(loadPageError(JSON.stringify(err)));
  }
}

// Individual exports for testing
function* watchGetPage() {
  yield takeLatest(LOAD_PAGE_REQUEST, getPage);
}

export default {
  watchGetPage,
};
