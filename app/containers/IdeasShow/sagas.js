import { call, put, takeLatest } from 'redux-saga/effects';
import {
  LOAD_COMMENTS_REQUEST, LOAD_IDEA_REQUEST, STORE_COMMENT_REQUEST,
} from './constants';
import {
  loadIdeaSuccess, commentsLoaded, commentsLoadError, publishCommentError, ideaLoadError, loadComments,
} from './actions';
import { mergeJsonApiResources } from '../../utils/resources/actions';
import { createIdeaComment, fetchIdea, fetchIdeaComments } from '../../api';

export function* loadIdea(action) {
  try {
    const response = yield call(fetchIdea, action.payload);
    yield put(loadIdeaSuccess(response));
  } catch (e) {
    yield put(ideaLoadError(JSON.stringify(e.errors)));
  }
}

export function* loadIdeaComments(action) {
  try {
    const response = yield call(fetchIdeaComments, action.nextCommentPageNumber, action.nextCommentPageItemCount, action.ideaId);
    yield put(mergeJsonApiResources(response));
    yield put(commentsLoaded(response));
  } catch (e) {
    yield put(commentsLoadError(JSON.stringify(e.errors)));
  }
}

export function* publishComment(action) {
  try {
    const ideaId = action.ideaId;
    const response = yield call(createIdeaComment, ideaId, action.userId, action.htmlContents, action.parentId);
    yield put(mergeJsonApiResources(response));
    // reload comments
    yield put(loadComments(ideaId, null, null, true));
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
