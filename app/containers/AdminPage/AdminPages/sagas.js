/*
 *
 * AdminPages sagas
 *
 */

import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { loadPagesError, loadPagesSuccess } from './actions';
import { LOAD_PAGES_REQUEST } from './constants';
import { fetchPages } from '../../../api';
import { mergeJsonApiResources } from '../../../utils/resources/actions';

export function* getPages(action) {
  try {
    const pageCount = action.pageCount;
    const usersResponse = yield call(fetchPages, {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });

    yield put(mergeJsonApiResources(usersResponse));
    yield put(loadPagesSuccess(usersResponse, pageCount));
  } catch (err) {
    yield put(loadPagesError(JSON.stringify(err)));
  }
}

function* watchLoadPages() {
  yield takeLatest(LOAD_PAGES_REQUEST, getPages);
}

export default [
  watchLoadPages,
];
