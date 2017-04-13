import { call, put, takeLatest } from 'redux-saga/effects';
import {
  LOAD_COMMENTS_REQUEST,
  LOAD_IDEA_REQUEST, STORE_COMMENT_REQUEST,
} from './constants';
import {
  loadIdeaSuccess,
  loadIdeaError, commentsLoaded, commentsLoadError, commentPublished, publishCommentError,
} from './actions';
import { mergeJsonApiResources } from '../../utils/resources/actions';
import { createIdeaComment, fetchIdea, fetchIdeaComments } from '../../api';

export function* loadIdea(action) {
  try {
    const json = yield call(fetchIdea, action.payload);
    yield put(loadIdeaSuccess(json.data));
  } catch (e) {
    yield put(loadIdeaError(e));
  }
}

export function* loadIdeaComments(action) {
  try {
    const response = yield call(fetchIdeaComments, action.ideaId);
    yield put(mergeJsonApiResources(response));
    yield put(commentsLoaded(response));
  } catch (e) {
    yield put(commentsLoadError(JSON.stringify(e.errors)));
  }
}

export function* publishComment(action) {
  try {
    // TODO: pass in the right parameters
    const response = yield call(createIdeaComment, action.ideaId, action.userId, action.htmlContents, action.parentId);
    yield put(mergeJsonApiResources(response));

    yield put(commentPublished(response.data));
  } catch (e) {
    yield put(publishCommentError(JSON.stringify(e.errors)));
  }
}

export function* watchFetchIdea() {
  yield takeLatest(LOAD_IDEA_REQUEST, loadIdea);
}

export function* watchFetchComments() {
  yield takeLatest(LOAD_COMMENTS_REQUEST, loadIdeaComments);
}

export function* watchStoreComment() {
  yield takeLatest(STORE_COMMENT_REQUEST, publishComment);
}
