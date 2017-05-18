import { takeLatest } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { createIdea, fetchTopics, fetchAreas } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { setGoBackToCode } from 'utils/store/actions';

import {
  loadAreasError,
  loadAreasSuccess,
  loadTopicsError,
  loadTopicsSuccess,
  publishIdeaError, publishIdeaSuccess,
} from './actions';
import { LOAD_AREAS_REQUEST, LOAD_TOPICS_REQUEST, PUBLISH_IDEA_REQUEST } from './constants';


export const getIdeaRequestContent = (ideaMultiloc, titleMultiloc, images, attachments, userId, isDraft, topics, areas) => {
  const result = {};

  result.author_id = userId;
  result.publication_status = (isDraft ? 'draft' : 'published');
  result.title_multiloc = titleMultiloc;
  result.body_multiloc = ideaMultiloc;
  result.images = images;
  result.files = attachments.toJS();
  result.topics = topics;
  result.areas = areas;

  return result;
};

// Individual exports for testing
export function* postIdea(action) {
  if (!action.userId) {
    const matRandom = 'GET_BACK_HERE';
    yield put(setGoBackToCode(matRandom));
    yield put(push('/sign-in'));
    yield take(matRandom);
    yield put(push('/ideas/new'));
  }
  const { payload, titles, images, attachments, topics, areas, userId, isDraft } = action;

  // merge relevant fields to match API request body format
  const requestBody = getIdeaRequestContent(payload, titles, images, attachments, userId, isDraft, topics, areas);
  try {
    const response = yield call(createIdea, requestBody);
    yield put(mergeJsonApiResources(response));
    yield put(publishIdeaSuccess());
  } catch (err) {
    yield put(publishIdeaError());
  }
}

export function* getTopics() {
  try {
    const response = yield call(fetchTopics);

    yield put(mergeJsonApiResources(response));
    yield put(loadTopicsSuccess(response));
  } catch (err) {
    yield put(loadTopicsError(JSON.stringify(err)));
  }
}

export function* getAreas() {
  try {
    const response = yield call(fetchAreas);

    yield put(mergeJsonApiResources(response));
    yield put(loadAreasSuccess(response));
  } catch (err) {
    yield put(loadAreasError(JSON.stringify(err)));
  }
}

function* watchStoreIdea() {
  yield takeLatest(PUBLISH_IDEA_REQUEST, postIdea);
}

function* watchGetTopics() {
  yield takeLatest(LOAD_TOPICS_REQUEST, getTopics);
}

function* watchGetAreas() {
  yield takeLatest(LOAD_AREAS_REQUEST, getAreas);
}

export default {
  watchStoreIdea,
  watchGetTopics,
  watchGetAreas,
};
