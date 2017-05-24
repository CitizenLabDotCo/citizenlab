import { call, put, takeLatest } from 'redux-saga/effects';
import { fetchProject } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { LOAD_PROJECT_REQUEST } from './constants';
import { loadProjectSuccess, loadProjectError } from './actions';

export function* loadProject(action) {
  try {
    const response = yield call(fetchProject, action.payload);
    yield put(mergeJsonApiResources(response));
    yield put(loadProjectSuccess(response));
  } catch (e) {
    yield put(loadProjectError(e));
  }
}

function* watchLoadIdea() {
  yield takeLatest(LOAD_PROJECT_REQUEST, loadProject);
}


export default { watchLoadIdea };
