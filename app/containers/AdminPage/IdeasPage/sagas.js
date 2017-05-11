import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { loadIdeasSuccess, loadIdeasError, loadTopicsSuccess, loadTopicsError, loadAreasSuccess, loadAreasError } from './actions';
import { LOAD_IDEAS_REQUEST, LOAD_TOPICS_REQUEST, LOAD_AREAS_REQUEST } from './constants';
import { fetchIdeas, fetchTopics, fetchAreas } from '../../../api';
import { mergeJsonApiResources } from '../../../utils/resources/actions';

function* getIdeas(action) {
  try {
    const pageCount = action.pageCount;
    const ideasResponse = yield call(fetchIdeas, {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });

    yield put(mergeJsonApiResources(ideasResponse));
    yield put(loadIdeasSuccess(ideasResponse, pageCount));
  } catch (err) {
    yield put(loadIdeasError(err));
  }
}

export function* getTopics() {
  try {
    const topicsResponse = yield call(fetchTopics);
    yield put(mergeJsonApiResources(topicsResponse));
    yield put(loadTopicsSuccess(topicsResponse));
  } catch (err) {
    yield put(loadTopicsError(err));
  }
}

export function* getAreas() {
  try {
    const areasResponse = yield call(fetchAreas);
    yield put(mergeJsonApiResources(areasResponse));
    yield put(loadAreasSuccess(areasResponse));
  } catch (err) {
    yield put(loadAreasError(err));
  }
}

export function* watchLoadIdeas() {
  yield takeLatest(LOAD_IDEAS_REQUEST, getIdeas);
}


export function* watchLoadTopics() {
  yield takeLatest(LOAD_TOPICS_REQUEST, getTopics);
}

export function* watchLoadAreas() {
  yield takeLatest(LOAD_AREAS_REQUEST, getAreas);
}
