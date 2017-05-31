import { takeLatest, call, put } from 'redux-saga/effects';
import { fetchTopics } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { loadTopicsError, loadTopicsSuccess } from './actions';
import { LOAD_TOPICS_REQUEST } from './constants';

// Individual exports for testing
export function* loadTopicsSaga(action) {
  const queryParameters = (action.initialLoad
    ? {}
    : {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });

  try {
    const response = yield call(fetchTopics, queryParameters);

    yield put(mergeJsonApiResources(response));
    yield put(loadTopicsSuccess(response));
  } catch (e) {
    yield put(loadTopicsError(e.json.errors));
  }
}

function* loadTopicsWatcher() {
  yield takeLatest(LOAD_TOPICS_REQUEST, loadTopicsSaga);
}

export default {
  loadTopicsWatcher,
};

