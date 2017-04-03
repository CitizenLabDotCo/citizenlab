import request from 'utils/request';
import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import {
  draftStored, storeDraftError, draftLoaded, loadDraftError, publishIdeaError,
  ideaPublished,
} from './actions';
import {
  STORE_DRAFT, LOAD_DRAFT, STORE_IDEA,
} from './constants';
import { createIdea } from '../../api';
import { mergeJsonApiResources } from '../../utils/resources/actions';

export const getIdeaRequestContent = (ideaMultiloc, titleMultiloc, images, attachments, userId, isPublish) => {
  const result = {};

  result.author_id = userId;
  result.publication_status = (isPublish ? 'published' : 'draft');
  result.title_multiloc = titleMultiloc;
  result.body_multiloc = ideaMultiloc;
  result.images = images.toJS();
  result.files = attachments.toJS();

  return result;
};

// Individual exports for testing
export function* postDraft(action) {
  const requestURL = 'http://demo9193680.mockable.io/draft-post';

  try {
    yield call(request, requestURL, {
      method: 'POST',
      body: JSON.stringify(action.draft),
    });

    yield put(draftStored());
  } catch (err) {
    yield put(storeDraftError(err));
  }
}

export function* getDraft() {
  const requestURL = 'http://localhost:3030/draft-get-html';

  try {
    const response = yield call(request, requestURL);

    yield put(draftLoaded(response.content));
  } catch (err) {
    yield put(loadDraftError(err));
  }
}

export function* postIdea(action) {
  const { contents, titles, images, attachments, userId } = action;

  // merge relevant fields to match API request body format
  const requestBody = getIdeaRequestContent(contents, titles, images, attachments, userId, true);
console.log(requestBody);
  try {
    const response = yield call(createIdea, requestBody);

    yield put(mergeJsonApiResources(response));
    yield put(ideaPublished());
  } catch (err) {
    yield put(publishIdeaError());
  }
}

export function* storeDraft() {
  yield takeLatest(STORE_DRAFT, postDraft);
}

export function* loadDraft() {
  yield takeLatest(LOAD_DRAFT, getDraft);
}

export function* storeIdea() {
  yield takeLatest(STORE_IDEA, postIdea);
}

// All sagas to be loaded
export default [
  storeDraft,
  loadDraft,
  storeIdea,
];
