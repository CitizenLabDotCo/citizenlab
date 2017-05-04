import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { fetchIdeas, fetchTopics, fetchAreas, filterIdeas as filterIdeasQuery } from 'api';
import { LOAD_IDEAS_REQUEST, LOAD_TOPICS_REQUEST, LOAD_AREAS_REQUEST, FILTER_IDEAS_REQUEST } from './constants';
import {
  ideasLoaded,
  ideasLoadingError,
  loadTopicsSuccess,
  loadTopicsError,
  loadAreasSuccess,
  loadAreasError,
  resetIdeas,
} from './actions';

export function* getIdeas(action) {
  try {
    const ideaResponse = yield call(fetchIdeas,
      action.search,
      {
        'page[number]': action.nextPageNumber,
        'page[size]': action.nextPageItemCount,
        ...action.filters,
      }
    );
    yield put(mergeJsonApiResources(ideaResponse));
    if (action.initialLoad) {
      yield put(resetIdeas());
    }
    yield put(ideasLoaded(ideaResponse));
  } catch (err) {
    yield put(ideasLoadingError(err));
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

export function* filterSaga() {
  yield takeLatest(FILTER_IDEAS_REQUEST, filterIdeas);
}
