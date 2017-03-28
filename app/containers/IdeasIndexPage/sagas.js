import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import Api from 'api';
import { LOAD_IDEAS } from './constants';
import { ideasLoaded, ideasLoadingError } from './actions';

export function* fetchIdeas() {
  try {
    const ideaResponse = yield call(Api.fetchIdeas); // eslint-disable-line
    yield put(mergeJsonApiResources(ideaResponse));
    yield put(ideasLoaded(ideaResponse));
  } catch (err) {
    yield put(ideasLoadingError(err));
  }
}

export function* defaultSaga() {
  yield takeLatest(LOAD_IDEAS, fetchIdeas);
}

// All sagas to be loaded
export default [
  defaultSaga,
];
