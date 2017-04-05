import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { LOAD_IDEAS_REQUEST } from './constants';
import { ideasLoaded, ideasLoadingError } from './actions';
import { fetchIdeas } from '../../api';

export function* getIdeas(action) {
  let urlParameters = '';

  if (action.nextPageNumber) {
    urlParameters = `?page%5Bnumber%5D=${action.nextPageNumber}&page%5Bsize%5D=25`;
  }

  try {
    const ideaResponse = yield call(fetchIdeas, urlParameters); // eslint-disable-line
    yield put(mergeJsonApiResources(ideaResponse));
    yield put(ideasLoaded(ideaResponse));
  } catch (err) {
    yield put(ideasLoadingError(err));
  }
}

export function* defaultSaga() {
  yield takeLatest(LOAD_IDEAS_REQUEST, getIdeas);
}

// All sagas to be loaded
export default [
  defaultSaga,
];

