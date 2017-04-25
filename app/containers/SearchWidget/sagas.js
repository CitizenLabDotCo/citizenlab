import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { fetchIdeas } from 'api';

import { searchIdeasError, searchIdeasSuccess } from './actions';
import { SEARCH_IDEAS_REQUEST } from './constants';

export function* getIdeasFiltered(action) {
  try {
    const response = yield call(fetchIdeas, {
      search: action.payload,
    });
    yield put(mergeJsonApiResources(response));
    yield put(searchIdeasSuccess(response));
  } catch (err) {
    yield put(searchIdeasError(JSON.stringify(err)));
  }
}

export function* watchSearchIdeasRequest() {
  yield takeLatest(SEARCH_IDEAS_REQUEST, getIdeasFiltered);
}

