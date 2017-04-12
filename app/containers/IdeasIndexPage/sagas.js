import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { LOAD_IDEAS_REQUEST } from './constants';
import { ideasLoaded, ideasLoadingError } from './actions';
import { fetchIdeas } from '../../api';

export function* getIdeas(action) {
  try {
    const ideaResponse = yield call(fetchIdeas, action.nextPageNumber, action.nextPageItemCount); // eslint-disable-line
    yield put(mergeJsonApiResources(
      ideaResponse,
      !action.nextPageNumber,
    ));
    yield put(ideasLoaded(ideaResponse));
  } catch (err) {
    yield put(ideasLoadingError(err));
  }
}

export function* ideas() {
  yield takeLatest(LOAD_IDEAS_REQUEST, getIdeas);
}

// All sagas to be loaded
export default [
  ideas,
];

