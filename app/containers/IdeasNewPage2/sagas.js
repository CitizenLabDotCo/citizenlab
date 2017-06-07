import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { topicsLoaded, areasLoaded, projectsLoaded } from './actions';
import { LOAD_TOPICS_REQUEST, LOAD_AREAS_REQUEST, LOAD_PROJECTS_REQUEST } from './constants';
import { fetchTopics, fetchAreas, fetchProjects } from '../../api';
import { mergeJsonApiResources } from '../../utils/resources/actions';

function* getTopics() {
  try {
    const topicsResponse = yield call(fetchTopics);
    yield put(mergeJsonApiResources(topicsResponse));
    yield put(topicsLoaded(topicsResponse));
  } catch (err) {
    console.log(err);
  }
}

function* getAreas() {
  try {
    const areasResponse = yield call(fetchAreas);
    yield put(mergeJsonApiResources(areasResponse));
    yield put(areasLoaded(areasResponse));
  } catch (err) {
    console.log(err);
  }
}

function* getProjects() {
  try {
    const projectsResponse = yield call(fetchProjects);
    yield put(mergeJsonApiResources(projectsResponse));
    yield put(projectsLoaded(projectsResponse));
  } catch (err) {
    console.log(err);
  }
}

function* watchLoadTopics() {
  yield takeLatest(LOAD_TOPICS_REQUEST, getTopics);
}

function* watchLoadAreas() {
  yield takeLatest(LOAD_AREAS_REQUEST, getAreas);
}

function* watchLoadProjects() {
  yield takeLatest(LOAD_PROJECTS_REQUEST, getProjects);
}

export default {
  watchLoadTopics,
  watchLoadAreas,
  watchLoadProjects,
};
