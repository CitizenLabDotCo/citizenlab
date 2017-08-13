import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchIdea, fetchIdeaBySlug, submitIdeaVote, createIdeaComment, fetchIdeaComments, deleteIdeaComment } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';

import {
  LOAD_IDEA_REQUEST, LOAD_COMMENTS_REQUEST, DELETE_COMMENT_REQUEST, PUBLISH_COMMENT_REQUEST,
} from './constants';

import {
  loadIdeaSuccess, loadIdeaError, voteIdeaError, voteIdeaSuccess, loadCommentsSuccess, deleteCommentSuccess, publishCommentSuccess, loadCommentsError, publishCommentError, loadCommentsRequest } from './actions';

export function* loadIdea(action) {
  try {
    let response;
    if (action.payload.id) {
      response = yield call(fetchIdea, action.payload.id);
    } else if (action.payload.slug) {
      response = yield call(fetchIdeaBySlug, action.payload.slug);
    }
    yield put(mergeJsonApiResources(response));
    yield put(loadIdeaSuccess(response));
  } catch (e) {
    yield put(loadIdeaError(JSON.stringify(e)));
  }
}

export function* postIdeaVote(action) {
  try {
    const { ideaId, mode } = action;
    const response = yield call(submitIdeaVote, ideaId, mode);
    yield put(mergeJsonApiResources(response));
    yield put(voteIdeaSuccess(response));
  } catch (e) {
    yield put(voteIdeaError(JSON.stringify(e)));
  }
}

export function* loadIdeaComments(action) {
  try {
    const response = yield call(fetchIdeaComments, action.nextCommentPageNumber, action.nextCommentPageItemCount, action.ideaId);
    yield put(mergeJsonApiResources(response));
    yield put(loadCommentsSuccess(response));
  } catch (e) {
    yield put(loadCommentsError());
  }
}

export function* publishComment({ ideaId, payload }) {
  try {
    const response = yield call(createIdeaComment, ideaId, payload);
    yield put(mergeJsonApiResources(response));
    yield put(publishCommentSuccess(response, payload.parent_id));
    yield put(loadCommentsRequest(ideaId));
  } catch (e) {
    yield put(publishCommentError(e, payload.parent_id));
  }
}


export function* deleteComment(action) {
  const { commentId } = action;
  yield call(deleteIdeaComment, commentId);
  yield put(deleteCommentSuccess(commentId));
}

function* watchCreateComment() {
  yield takeLatest(PUBLISH_COMMENT_REQUEST, publishComment);
}

function* watchLoadIdea() {
  yield takeLatest(LOAD_IDEA_REQUEST, loadIdea);
}

function* watchLoadComments() {
  yield takeLatest(LOAD_COMMENTS_REQUEST, loadIdeaComments);
}

function* watchDeleteComment() {
  yield takeLatest(DELETE_COMMENT_REQUEST, deleteComment);
}

export default {
  watchLoadIdea,
  watchLoadComments,
  watchDeleteComment,
  watchCreateComment,
};
