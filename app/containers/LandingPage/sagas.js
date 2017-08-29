import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { ideasLoaded, ideasLoadError, projectsLoaded, projectsLoadError } from './actions';
import { LOAD_IDEAS_REQUEST, LOAD_PROJECTS_REQUEST } from './constants';
import { fetchIdeas, fetchProjects } from '../../api';
import { mergeJsonApiResources } from '../../utils/resources/actions';

function* getIdeas(action) {
  try {
    const ideasResponse = yield call(fetchIdeas, {
      sort: 'trending',
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });
    yield put(mergeJsonApiResources(ideasResponse));
    yield put(ideasLoaded(ideasResponse));
  } catch (err) {
    yield put(ideasLoadError(err));
  }
}

function* getProjects(action) {
  try {
    const projectsResponse = yield call(fetchProjects, {
      'page[number]': action.nextPageNumber,
      'page[size]': action.nextPageItemCount,
    });
    yield put(mergeJsonApiResources(projectsResponse));
    yield put(projectsLoaded(projectsResponse));
  } catch (err) {
    yield put(projectsLoadError(err));
  }
}

function* watchLoadIdeas() {
  yield takeLatest(LOAD_IDEAS_REQUEST, getIdeas);
}

function* watchLoadProjects() {
  yield takeLatest(LOAD_PROJECTS_REQUEST, getProjects);
}

export default {
  watchLoadIdeas,
  watchLoadProjects,
};
