import { takeLatest } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { upvoteIdea, downvoteIdea, deleteIdeaVote, fetchIdea } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import {
  ideaVoteSuccess,
  ideaVoteError,
  cancelIdeaVoteSuccess,
  cancelIdeaVoteError,
} from './actions';

import {
  IDEA_VOTE_REQUEST,
  CANCEL_IDEA_VOTE_REQUEST,
} from './constants';

function* handleIdeaVote(action) {
  try {
    const apiCall = action.payload.mode === 'up' ? upvoteIdea : downvoteIdea;
    yield call(apiCall, action.payload.ideaId);
    const ideaResponse = yield call(fetchIdea, action.payload.ideaId);
    yield put(mergeJsonApiResources(ideaResponse));
    yield put(ideaVoteSuccess(ideaResponse));
  } catch (err) {
    yield put(ideaVoteError(err));
  }
}

function* handleCancelIdeaVote(action) {
  try {
    yield call(deleteIdeaVote, action.payload.voteId);
    const ideaResponse = yield call(fetchIdea, action.payload.ideaId);
    yield put(mergeJsonApiResources(ideaResponse));
    yield put(cancelIdeaVoteSuccess(ideaResponse));
  } catch (err) {
    yield put(cancelIdeaVoteError(err));
  }
}

function* watchIdeaVoteRequest() {
  yield takeLatest(IDEA_VOTE_REQUEST, handleIdeaVote);
}

function* watchCancelIdeaVoteRequest() {
  yield takeLatest(CANCEL_IDEA_VOTE_REQUEST, handleCancelIdeaVote);
}

export default {
  watchIdeaVoteRequest,
  watchCancelIdeaVoteRequest,
};
