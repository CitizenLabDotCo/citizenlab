import request from 'utils/request';
import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import {
  draftStored, storeDraftError, draftLoaded, loadDraftError, ideaStored, storeIdeaError,
  attachmentsLoaded, attachmentStored, storeAttachmentError, loadAttachmentsError, imagesLoaded, loadImagesError,
  imageStored, storeImageError,
} from './actions';
import {
  STORE_DRAFT, LOAD_DRAFT, STORE_IDEA, STORE_ATTACHMENT, LOAD_ATTACHMENTS, LOAD_IMAGES,
  STORE_IMAGE,
} from './constants';

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

export function* getAttachments() {
  const requestURL = 'http://demo9193680.mockable.io/attachments-get';

  try {
    const response = yield call(request, requestURL);

    yield put(attachmentsLoaded(response.sources));
  } catch (err) {
    yield put(loadAttachmentsError());
  }
}

export function* postAttachment(action) {
  const requestURL = 'http://cl2-mock.getsandbox.com/post-attachment';

  const payload = new FormData();
  payload.append('file', action.source);

  try {
    const response = yield call(request, requestURL, {
      method: 'POST',
      body: payload,
    });

    yield put(attachmentStored(response.source));
  } catch (err) {
    yield put(storeAttachmentError());
  }
}

export function* getImages() {
  const requestURL = 'http://demo9193680.mockable.io/images-get';

  try {
    const response = yield call(request, requestURL);

    yield put(imagesLoaded(response.sources));
  } catch (err) {
    yield put(loadImagesError());
  }
}

export function* postImage(action) {
  const requestURL = 'http://demo9193680.mockable.io/image-post';

  const payload = new FormData();
  payload.append('file', action.source);

  try {
    const response = yield call(request, requestURL, {
      method: 'POST',
      body: payload,
    });

    yield put(imageStored(response.source));
  } catch (err) {
    yield put(storeImageError());
  }
}

export function* postIdea(action) {
  const requestURL = 'http://localhost:3030/idea-post';

  try {
    const response = yield call(request, requestURL, {
      method: 'POST',
      body: JSON.stringify(action.idea),
    });

    yield put(ideaStored(response));
  } catch (err) {
    yield put(storeIdeaError());
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

export function* loadAttachments() {
  yield takeLatest(LOAD_ATTACHMENTS, getAttachments);
}

export function* storeAttachment() {
  yield takeLatest(STORE_ATTACHMENT, postAttachment);
}

export function* loadImages() {
  yield takeLatest(LOAD_IMAGES, getImages);
}

export function* storeImage() {
  yield takeLatest(STORE_IMAGE, postImage);
}

// All sagas to be loaded
export default [
  storeDraft,
  loadDraft,
  storeIdea,
  loadAttachments,
  storeAttachment,
  loadImages,
  storeImage,
];
