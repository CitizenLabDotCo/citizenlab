import { call } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';

function* trackAction(action) {
  try {
    yield call(window.analytics.track, action.meta.track.event, action.meta.track.properties || {});
  } catch (error) {
    // yield put(loadAreasError(error));
  }
}

function isTrackableAction(action) {
  return action && action.meta && action.meta.track;
}

function* watchAll() {
  yield takeLatest(isTrackableAction, trackAction);
}

export default {
  watchAll,
};
