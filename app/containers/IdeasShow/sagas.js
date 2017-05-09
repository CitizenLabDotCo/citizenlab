import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchIdea, fetchIdeaVotes, submitIdeaVote, createIdeaComment, fetchIdeaComments, deleteIdeaComment } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';

import {
  LOAD_IDEA_REQUEST, LOAD_IDEA_VOTES_REQUEST, VOTE_IDEA_REQUEST, STORE_COMMENT_REQUEST, LOAD_COMMENTS_REQUEST, DELETE_COMMENT_REQUEST,
} from './constants';

import {
  loadIdeaSuccess, ideaLoadError, loadVotesError, votesLoaded, voteIdeaError, ideaVoted, loadComments, commentsLoaded, commentsLoadError, publishCommentError,
} from './actions';

export function* loadIdea(action) {
  try {
    const response = yield call(fetchIdea, action.payload);
    yield put(mergeJsonApiResources(response));
    yield put(loadIdeaSuccess(response));
  } catch (e) {
    yield put(ideaLoadError(JSON.stringify(e)));
  }
}

export function* getIdeaVotes(action) {
  const { ideaId } = action;

  try {
    const response = yield call(fetchIdeaVotes, ideaId);
    yield put(mergeJsonApiResources(response));
    yield put(votesLoaded(response));
  } catch (e) {
    yield put(loadVotesError(JSON.stringify(e)));
  }
}

export function* postIdeaVote(action) {
  const { ideaId, mode } = action;

  try {
    const response = yield call(submitIdeaVote, ideaId, mode);
    yield put(mergeJsonApiResources(response));
    yield put(ideaVoted(response));
  } catch (e) {
    yield put(voteIdeaError(JSON.stringify(e)));
  }
}

export function* loadIdeaComments(action) {
  try {
    const response = yield call(fetchIdeaComments, action.nextCommentPageNumber, action.nextCommentPageItemCount, action.ideaId);
    yield put(mergeJsonApiResources(response));
    yield put(commentsLoaded(response));
  } catch (e) {
    yield put(commentsLoadError(JSON.stringify(e.errors || e.json)));
  }
}

export function* publishComment(action) {
  try {
    const ideaId = action.ideaId;
    const response = yield call(createIdeaComment, ideaId, action.userId, action.htmlContents, action.parentId);
    yield put(mergeJsonApiResources(response));
    yield put(loadComments(ideaId, null, null, true));
  } catch (e) {
    yield put(publishCommentError(JSON.stringify(e.errors)));
  }
}

export function* deleteComment(action) {
  try {
    const { commentId, ideaId } = action;
    const response = yield call(deleteIdeaComment, commentId);
    yield put(mergeJsonApiResources(response));
    yield put(loadComments(ideaId, null, null, true));
  } catch (e) {
    yield put(publishCommentError(JSON.stringify(e.errors)));
  }
}

function* watchLoadIdea() {
  yield takeLatest(LOAD_IDEA_REQUEST, loadIdea);
}

function* watchLoadIdeaVotes() {
  yield takeLatest(LOAD_IDEA_VOTES_REQUEST, getIdeaVotes);
}

function* watchVoteIdea() {
  yield takeLatest(VOTE_IDEA_REQUEST, postIdeaVote);
}

function* watchLoadComments() {
  yield takeLatest(LOAD_COMMENTS_REQUEST, loadIdeaComments);
}

function* watchStoreComment() {
  yield takeLatest(STORE_COMMENT_REQUEST, publishComment);
}

function* watchDeleteComment() {
  yield takeLatest(DELETE_COMMENT_REQUEST, deleteComment);
}

export default {
  watchLoadIdea,
  watchLoadIdeaVotes,
  watchVoteIdea,
  watchLoadComments,
  watchStoreComment,
  watchDeleteComment,
};
