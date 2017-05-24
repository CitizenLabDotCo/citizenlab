import { call, put, takeLatest, fork } from 'redux-saga/effects';
import { fetchIdea, fetchIdeaVotes, submitIdeaVote, createIdeaComment, fetchIdeaComments, deleteIdeaComment } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';

import {
  LOAD_IDEA_REQUEST, LOAD_VOTES_REQUEST, VOTE_IDEA_REQUEST, LOAD_COMMENTS_REQUEST, DELETE_COMMENT_REQUEST,
} from './constants';

import {
  loadIdeaSuccess, loadIdeaError, loadVotesError, loadVotesSuccess, voteIdeaError, voteIdeaSuccess, loadCommentsSuccess, loadcommentsError, deleteCommentSuccess, publishCommentSuccess,
} from './actions';

export function* loadIdea(action) {
  try {
    const response = yield call(fetchIdea, action.payload);
    yield put(mergeJsonApiResources(response));
    yield put(loadIdeaSuccess(response));
  } catch (e) {
    yield put(loadIdeaError(JSON.stringify(e)));
  }
}

export function* getIdeaVotes(action) {
  try {
    const { ideaId } = action;
    const response = yield call(fetchIdeaVotes, ideaId);
    yield put(mergeJsonApiResources(response));
    yield put(loadVotesSuccess(response));
  } catch (e) {
    yield put(loadVotesError(e));
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
    yield put(loadcommentsError(JSON.stringify(e.errors || e.json)));
  }
}

export function* publishCommentFlow({ ideaId, parentId, comment }) {
  const response = yield call(createIdeaComment, ideaId, comment, parentId);
  yield put(mergeJsonApiResources(response));
  yield put(publishCommentSuccess(response));
}

export function* publishCommentSaga(data, success, error) {
  try {
    yield call(publishCommentFlow, data);
    if (success) success();
  } catch (e) {
    if (error) error();
  }
}

export function* publishCommentFork(data, success, error) {
  yield fork(publishCommentSaga, data, success, error);
}


export function* deleteComment(action) {
  const { commentId } = action;
  yield call(deleteIdeaComment, commentId);
  yield put(deleteCommentSuccess(commentId));
}

function* watchLoadIdea() {
  yield takeLatest(LOAD_IDEA_REQUEST, loadIdea);
}

function* watchLoadIdeaVotes() {
  yield takeLatest(LOAD_VOTES_REQUEST, getIdeaVotes);
}

function* watchVoteIdea() {
  yield takeLatest(VOTE_IDEA_REQUEST, postIdeaVote);
}

function* watchLoadComments() {
  yield takeLatest(LOAD_COMMENTS_REQUEST, loadIdeaComments);
}

function* watchDeleteComment() {
  yield takeLatest(DELETE_COMMENT_REQUEST, deleteComment);
}

export default {
  watchLoadIdea,
  watchLoadIdeaVotes,
  watchVoteIdea,
  watchLoadComments,
  watchDeleteComment,
};
