import { call, put, takeLatest } from 'redux-saga/effects';
import {
  LOAD_IDEA_REQUEST, LOAD_IDEA_VOTES_REQUEST, VOTE_IDEA_REQUEST, STORE_COMMENT_REQUEST, LOAD_COMMENTS_REQUEST,
} from './constants';
import {
  loadIdeaSuccess, loadIdeaError, loadVotesError, votesLoaded, voteIdeaError, ideaVoted, loadCommentsRequest, loadCommentsError, publishCommentError, loadCommentsSuccess,
} from './actions';
import { mergeJsonApiResources } from '../../utils/resources/actions';
import { fetchIdea, fetchIdeaVotes, submitIdeaVote, createIdeaComment, fetchIdeaComments } from '../../api';

export function* loadIdea(action) {
  try {
    const response = yield call(fetchIdea, action.payload);
    yield put(mergeJsonApiResources(response));
    yield put(loadIdeaSuccess(response));
  } catch (e) {
    yield put(loadIdeaError(JSON.stringify(e.errors)));
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
    yield put(loadCommentsSuccess(response));
  } catch (e) {
    yield put(loadCommentsError(JSON.stringify(e.errors)));
  }
}

export function* publishComment(action) {
  try {
    const ideaId = action.ideaId;
    const response = yield call(createIdeaComment, ideaId, action.userId, action.htmlContents, action.parentId);
    yield put(mergeJsonApiResources(response));
    // reload comments
    yield put(loadCommentsRequest(ideaId, null, null, true));
  } catch (e) {
    yield put(publishCommentError(JSON.stringify(e.errors)));
  }
}

export function* watchFetchIdea() {
  yield takeLatest(LOAD_IDEA_REQUEST, loadIdea);
}

export function* watchLoadIdeaVotes() {
  yield takeLatest(LOAD_IDEA_VOTES_REQUEST, getIdeaVotes);
}

export function* watchVoteIdea() {
  yield takeLatest(VOTE_IDEA_REQUEST, postIdeaVote);
}

export function* watchFetchComments() {
  yield takeLatest(LOAD_COMMENTS_REQUEST, loadIdeaComments);
}

export function* watchStoreComment() {
  yield takeLatest(STORE_COMMENT_REQUEST, publishComment);
}
