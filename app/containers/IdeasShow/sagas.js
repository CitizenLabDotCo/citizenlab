import { call, put, takeLatest } from 'redux-saga/effects';
import * as Api from 'api';
import {
  LOAD_IDEA_REQUEST,
} from './constants';
import {
  loadIdeaSuccess,
  loadIdeaError,
} from './actions';

export function* fetchIdea(action) {
  try {
    const json = yield call(Api.fetchIdea, action.payload); // eslint-disable-line
    yield put(loadIdeaSuccess(json.data));
  } catch (e) {
    yield put(loadIdeaError(e));
  }
}

function* watchFetchIdea() {
  yield takeLatest(LOAD_IDEA_REQUEST, fetchIdea);
}

export default [
  watchFetchIdea,
];
