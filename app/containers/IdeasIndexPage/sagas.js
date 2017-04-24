import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { LOAD_IDEAS_REQUEST, LOAD_TOPICS_REQUEST, LOAD_AREAS_REQUEST } from './constants';
import {
  loadTopicsSuccess, loadTopicsError, loadAreasSuccess, loadAreasError,
  loadIdeasSuccess, loadIdeasError,
} from './actions';
import { fetchIdeas, fetchTopics, fetchAreas } from '../../api';

export function* getIdeas(action) {
  try {
    const ideaResponse = yield call(fetchIdeas, {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
      ...action.filters,
    });
    yield put(mergeJsonApiResources(ideaResponse));
    yield put(loadIdeasSuccess(ideaResponse));
  } catch (err) {
    yield put(loadIdeasError(JSON.stringify(err)));
  }
}

export function* getTopics(action) {
  try {
    const topicsResponse = yield call(fetchTopics, {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });
    yield put(mergeJsonApiResources(topicsResponse));
    yield put(loadTopicsSuccess(topicsResponse));
  } catch (err) {
    yield put(loadTopicsError(err));
  }
}

export function* getAreas(action) {
  try {
    const areasResponse = yield call(fetchAreas, {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });
    yield put(mergeJsonApiResources(areasResponse));
    yield put(loadAreasSuccess(areasResponse));
  } catch (err) {
    yield put(loadAreasError(err));
  }
}

export function* ideasSaga() {
  yield takeLatest(LOAD_IDEAS_REQUEST, getIdeas);
}

export function* topicsSaga() {
  yield takeLatest(LOAD_TOPICS_REQUEST, getTopics);
}

export function* areasSaga() {
  yield takeLatest(LOAD_AREAS_REQUEST, getAreas);
}
