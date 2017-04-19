import { call, put, takeLatest } from 'redux-saga/effects';
import {
  LOAD_IDEA_REQUEST, LOAD_IDEA_VOTES_REQUEST, VOTE_IDEA_REQUEST,
} from './constants';
import {
  loadIdeaSuccess, loadIdeaError, loadVotesError, votesLoaded, voteIdeaError, ideaVoted,
} from './actions';
import { fetchIdea, fetchIdeaVotes, submitIdeaVote } from '../../api';
import { mergeJsonApiResources } from '../../utils/resources/actions';

export function* postIdea(action) {
  try {
    const json = yield call(fetchIdea, action.payload);
    yield put(loadIdeaSuccess(json.data));
  } catch (e) {
    yield put(loadIdeaError(e));
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

export function* watchFetchIdea() {
  yield takeLatest(LOAD_IDEA_REQUEST, postIdea);
}

export function* watchLoadIdeaVotes() {
  yield takeLatest(LOAD_IDEA_VOTES_REQUEST, getIdeaVotes);
}

export function* watchVoteIdea() {
  yield takeLatest(VOTE_IDEA_REQUEST, postIdeaVote);
}
