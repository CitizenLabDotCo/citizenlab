import { call, put, takeLatest } from 'redux-saga/effects';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { LOAD_IDEAS_REQUEST, LOAD_TOPICS_REQUEST } from './constants';
import { ideasLoaded, ideasLoadingError, loadTopicsSuccess, loadTopicsError } from './actions';
import { fetchIdeas, fetchTopics } from '../../api';

export function* getIdeas(action) {
  try {
    const ideaResponse = yield call(fetchIdeas, {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
      ...action.filters,
    });
    yield put(mergeJsonApiResources(ideaResponse));
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

export function* ideasSaga() {
  yield takeLatest(LOAD_IDEAS_REQUEST, getIdeas);
}

export function* topicsSaga() {
  yield takeLatest(LOAD_TOPICS_REQUEST, getTopics);
}
