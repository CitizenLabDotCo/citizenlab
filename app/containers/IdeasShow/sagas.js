import { call, put, takeLatest } from 'redux-saga/effects';
import * as Api from 'api';
import {
  LOAD_IDEA_PENDING,
} from './constants';
import {
  loadIdeaFullfilled,
  loadIdeaRejected,
} from './actions';

export function* fetchIdea(action) {
  try {
    const json = yield call(Api.fetchIdea, action.payload); // eslint-disable-line
    yield put(loadIdeaFullfilled(json.data));
  } catch (e) {
    yield put(loadIdeaRejected(e));
  }
}

function* watchFetchIdea() {
  yield takeLatest(LOAD_IDEA_PENDING, fetchIdea);
}

export default [
  watchFetchIdea,
];
