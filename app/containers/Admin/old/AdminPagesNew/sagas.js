/*
 *
 * AdminPagesNew sagas
 *
 */
import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { createPage } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';

import { publishPageSuccess, publishPageError } from './actions';
import { PUBLISH_PAGE_REQUEST } from './constants';

// Individual exports for testing
export function* postPage(action) {
  const { payload, titles } = action;

  // merge relevant fields to match API request body format
  const requestBody = {
    title_multiloc: titles,
    body_multiloc: payload,
  };

  try {
    const response = yield call(createPage, requestBody);

    yield put(mergeJsonApiResources(response));
    yield put(publishPageSuccess());
  } catch (err) {
    yield put(publishPageError(JSON.stringify(err)));
  }
}


function* watchPublishPage() {
  yield takeLatest(PUBLISH_PAGE_REQUEST, postPage);
}

export default {
  watchPublishPage,
};
