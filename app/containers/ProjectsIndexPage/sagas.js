import { takeLatest, call, put } from 'redux-saga/effects';
import { fetchProjects } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { loadProjectsError, loadProjectsSuccess } from './actions';
import { LOAD_PROJECTS_REQUEST } from './constants';

// Individual exports for testing
export function* getProjects(action) {
  const queryParameters = (action.initialLoad
    ? {}
    : {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });

  try {
    const response = yield call(fetchProjects, queryParameters);

    yield put(mergeJsonApiResources(response));
    yield put(loadProjectsSuccess(response));
  } catch (err) {
    yield put(loadProjectsError(JSON.stringify(err)));
  }
}

function* watchFetchProjects() {
  yield takeLatest(LOAD_PROJECTS_REQUEST, getProjects);
}

export default {
  watchFetchProjects,
};

