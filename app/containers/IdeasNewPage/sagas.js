import { takeLatest } from 'redux-saga';
import { call, put, take } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { createIdea } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { setGoBackToCode } from 'utils/store/actions';

import {
 publishIdeaError, publishIdeaSuccess,
} from './actions';
import { PUBLISH_IDEA_REQUEST } from './constants';


export const getIdeaRequestContent = (ideaMultiloc, titleMultiloc, images, /* attachments, */ userId, isDraft, topics, areas, projects) => {
  const result = {};

  result.author_id = userId;
  result.publication_status = (isDraft ? 'draft' : 'published');
  result.title_multiloc = titleMultiloc;
  result.body_multiloc = ideaMultiloc;
  result.images = images;
  // result.files = attachments.toJS();
  result.topic_ids = topics;
  result.areas_ids = areas;
  result.project_id = projects[0]; // can be null

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
  const { payload, titles, images, /* attachments, */ topics, areas, projects, userId, isDraft } = action;

  // merge relevant fields to match API request body format
  const requestBody = getIdeaRequestContent(payload, titles, images, /* attachments, */ userId, isDraft, topics, areas, projects);
  try {
    const response = yield call(createIdea, requestBody);
    yield put(mergeJsonApiResources(response));
    yield put(publishIdeaSuccess());
  } catch (err) {
    yield put(publishIdeaError());
  }
}

function* watchStoreIdea() {
  yield takeLatest(PUBLISH_IDEA_REQUEST, postIdea);
}

export default {
  watchStoreIdea,
};
