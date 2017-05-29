import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { ideasLoaded, ideasLoadError } from './actions';
import { LOAD_IDEAS_REQUEST } from './constants';
import { fetchIdeas } from '../../api';
import { mergeJsonApiResources } from '../../utils/resources/actions';

function* getIdeas(action) {
  try {
    console.log('action.nextPageNumber: ' + action.nextPageNumber);
    console.log('action.nextPageItemCount: ' + action.nextPageItemCount);
    const ideasResponse = yield call(fetchIdeas, {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });
    yield put(mergeJsonApiResources(ideasResponse));
    yield put(ideasLoaded(ideasResponse));
  } catch (err) {
    yield put(ideasLoadError(err));
  }
}

export function* watchLoadIdeas() {
  yield takeLatest(LOAD_IDEAS_REQUEST, getIdeas);
}
