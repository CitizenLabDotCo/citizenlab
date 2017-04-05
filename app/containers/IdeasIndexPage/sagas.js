import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import Api from 'api';
import { LOAD_IDEAS_REQUEST } from './constants';
import { ideasLoaded, ideasLoadingError } from './actions';

export function* fetchIdeas(action) {
  let urlParameters = '';

  if (action.nextPageNumber) {
    urlParameters = `?page%5Bnumber%5D=${action.nextPageNumber}&page%5Bsize%5D=25`;
  }

  try {
    const ideaResponse = yield call(Api.fetchIdeas, urlParameters); // eslint-disable-line
    yield put(mergeJsonApiResources(ideaResponse));
    yield put(ideasLoaded(ideaResponse));
  } catch (err) {
    yield put(ideasLoadingError(err));
  }
}

export function* defaultSaga() {
  yield takeLatest(LOAD_IDEAS_REQUEST, fetchIdeas);
}

// All sagas to be loaded
export default [
  defaultSaga,
];

