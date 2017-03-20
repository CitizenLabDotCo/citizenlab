import request from 'utils/request';
import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { draftStored, storeDraftError, draftLoaded, loadDraftError } from './actions';
import { STORE_DRAFT, LOAD_DRAFT } from './constants';

// Individual exports for testing
export function* postDraft(action) {
  const requestURL = 'http://localhost:3030/draft-post';

  try {
    const response = yield call(request, requestURL, {
      method: 'POST',
      body: JSON.stringify(action.draft),
    });

    yield put(draftStored(response));
  } catch (err) {
    yield put(storeDraftError(err));
  }
}

export function* getDraft() {
  const requestURL = 'http://localhost:3030/draft-get';

  try {
    const response = yield call(request, requestURL);

    yield put(draftLoaded(response));
  } catch (err) {
    yield put(loadDraftError(err));
  }
}

export function* storeDraft() {
  yield takeLatest(STORE_DRAFT, postDraft);
}

export function* loadDraft() {
  yield takeLatest(LOAD_DRAFT, getDraft);
}

// All sagas to be loaded
export default [
  storeDraft,
  loadDraft,
];
