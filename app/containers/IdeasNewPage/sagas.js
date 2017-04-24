import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import {
  publishIdeaError, ideaPublished,
} from './actions';
import { STORE_IDEA } from './constants';
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
  const { contents, titles, images, attachments, userId, isDraft } = action;

  // merge relevant fields to match API request body format
  const requestBody = getIdeaRequestContent(contents, titles, images, attachments, userId, isDraft);

  try {
    const response = yield call(createIdea, requestBody);

    yield put(mergeJsonApiResources(response));
    yield put(ideaPublished());
  } catch (err) {
    yield put(publishIdeaError());
  }
}

export function* watchStoreIdea() {
  yield takeLatest(STORE_IDEA, postIdea);
}
