import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { fetchIdeas, fetchTopics, fetchAreas } from 'api';
import { LOAD_IDEAS_REQUEST, LOAD_TOPICS_REQUEST, LOAD_AREAS_REQUEST } from './constants';
import {
  loadIdeasSuccess,
  ideasLoadingError,
  loadTopicsSuccess,
  loadTopicsError,
  loadAreasSuccess,
  loadAreasError,
} from './actions';

export function* getIdeas(action) {
  try {
    const queryParams = {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
      ...action.filters,
    };
    Object.keys(queryParams).forEach((key) => (!queryParams[key] && (delete queryParams[key])));
    const ideaResponse = yield call(fetchIdeas, action.search, queryParams);
    yield put(mergeJsonApiResources(ideaResponse));
    yield put(loadIdeasSuccess(ideaResponse));
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

function* watchLoadIdeas() {
  yield takeLatest(LOAD_IDEAS_REQUEST, getIdeas);
}

function* watchLoadTopics() {
  yield takeLatest(LOAD_TOPICS_REQUEST, getTopics);
}

function* watchLoadAreas() {
  yield takeLatest(LOAD_AREAS_REQUEST, getAreas);
}

export default { watchLoadIdeas, watchLoadTopics, watchLoadAreas };
