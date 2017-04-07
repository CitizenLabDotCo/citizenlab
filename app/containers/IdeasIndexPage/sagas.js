import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import * as Api from 'api';
import {
  LOAD_IDEAS_REQUEST,
} from './constants';
import { ideasLoaded, ideasLoadingError } from './actions';

export function* fetchIdeas(action) {
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

function* watchFetchIdeas() {
  yield takeLatest(LOAD_IDEAS_REQUEST, fetchIdeas);
}

export default [
  watchFetchIdeas,
];
