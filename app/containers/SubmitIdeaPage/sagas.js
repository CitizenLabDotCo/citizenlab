import request from 'utils/request';
import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { draftStored, storeDraftError, draftLoaded, loadDraftError, ideaStored, storeIdeaError } from './actions';
import { STORE_DRAFT, LOAD_DRAFT, STORE_IDEA } from './constants';

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
  const requestURL = 'http://localhost:3030/draft-get-html';

  try {
    const response = yield call(request, requestURL);

    yield put(draftLoaded(response));
  } catch (err) {
    yield put(loadDraftError(err));
  }
}

export function* postIdea(action) {
  const requestURL = 'http://localhost:3030/idea-post';

  try {
    const response = yield call(request, requestURL, {
      method: 'POST',
      body: JSON.stringify(action.idea),
    });

    yield put(ideaStored(response));
  } catch (err) {
    yield put(storeIdeaError(err));
  }
}

export function* storeDraft() {
  yield takeLatest(STORE_DRAFT, postDraft);
}

export function* loadDraft() {
  yield takeLatest(LOAD_DRAFT, getDraft);
}

export function* storeIdea() {
  yield takeLatest(STORE_IDEA, postIdea);
}

// All sagas to be loaded
export default [
  storeDraft,
  loadDraft,
  storeIdea,
];
