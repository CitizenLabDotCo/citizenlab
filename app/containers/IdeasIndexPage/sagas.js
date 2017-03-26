import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { getIdeasRequest } from 'utils/request';
import { LOAD_IDEAS } from './constants';
import { ideasLoaded, ideasLoadingError } from './actions';

// Individual exports for testing

export function* getIdeas() {
  try {
    const ideaResponse = yield call(getIdeasRequest);
    yield put(mergeJsonApiResources(ideaResponse));
    yield put(ideasLoaded(ideaResponse));
  } catch (err) {
    yield put(ideasLoadingError(err));
  }
}

export function* defaultSaga() {
  yield takeLatest(LOAD_IDEAS, getIdeas);
}

// All sagas to be loaded
export default [
  defaultSaga,
];
