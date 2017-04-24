import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import {
  publishIdeaError, publishIdeaSuccess,
} from './actions';
import { PUBLISH_IDEA } from './constants';
import { createIdea } from '../../api';
import { mergeJsonApiResources } from '../../utils/resources/actions';

export const getIdeaRequestContent = (ideaMultiloc, titleMultiloc, images, attachments, userId, isDraft) => {
  const result = {};

  result.author_id = userId;
  result.publication_status = (isDraft ? 'draft' : 'published');
  result.title_multiloc = titleMultiloc;
  result.body_multiloc = ideaMultiloc;
  result.images = images;
  result.files = attachments.toJS();

  return result;
};

// Individual exports for testing
export function* postIdea(action) {
  const { payload, titles, images, attachments, userId, isDraft } = action;

  // merge relevant fields to match API request body format
  const requestBody = getIdeaRequestContent(payload, titles, images, attachments, userId, isDraft);

  try {
    const response = yield call(createIdea, requestBody);

    yield put(mergeJsonApiResources(response));
    yield put(publishIdeaSuccess());
  } catch (err) {
    yield put(publishIdeaError());
  }
}

export function* watchStoreIdea() {
  yield takeLatest(PUBLISH_IDEA, postIdea);
}
