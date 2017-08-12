import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { areasLoaded, loadAreasError } from './actions';
import { LOAD_AREAS_REQUEST } from './constants';
import { fetchAreas } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';

function* getAreas() {
  try {
    const areas = yield call(fetchAreas);
    yield put(mergeJsonApiResources(areas));
    yield put(areasLoaded(areas));
  } catch (error) {
    yield put(loadAreasError(error));
  }
}

function* watchLoadAreas() {
  yield takeLatest(LOAD_AREAS_REQUEST, getAreas);
}

export default {
  watchLoadAreas,
};
