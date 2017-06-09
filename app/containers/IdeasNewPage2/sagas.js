import { call, put } from 'redux-saga/effects';
import { takeLatest } from 'redux-saga';
import { topicsLoaded, areasLoaded, projectsLoaded, ideaSubmitted } from './actions';
import { LOAD_TOPICS_REQUEST, LOAD_AREAS_REQUEST, LOAD_PROJECTS_REQUEST, SUBMIT_IDEA_REQUEST } from './constants';
import { fetchTopics, fetchAreas, fetchProjects, createIdea } from 'api';
import { mergeJsonApiResources } from '../../utils/resources/actions';

function* getTopics() {
  try {
    const topicsResponse = yield call(fetchTopics);
    yield put(mergeJsonApiResources(topicsResponse));
    yield put(topicsLoaded(topicsResponse));
  } catch (error) {
    console.log(error);
  }
}

function* getAreas() {
  try {
    const areasResponse = yield call(fetchAreas);
    yield put(mergeJsonApiResources(areasResponse));
    yield put(areasLoaded(areasResponse));
  } catch (error) {
    console.log(error);
  }
}

function* getProjects() {
  try {
    const projectsResponse = yield call(fetchProjects);
    yield put(mergeJsonApiResources(projectsResponse));
    yield put(projectsLoaded(projectsResponse));
  } catch (error) {
    console.log(error);
  }
}

function* postIdea(action) {
  try {
    const { userId, title, description, topics, areas, project, publicationStatus } = action.payload;
    const response = yield call(createIdea, {
      author_id: userId,
      publication_status: publicationStatus,
      title_multiloc: title,
      body_multiloc: description,
      topic_ids: topics,
      area_ids: areas,
      project_id: project,
    });
    yield put(mergeJsonApiResources(response));
    yield put(ideaSubmitted(response.data.id));
  } catch (error) {
    console.log(error);
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

function* watchIdeaSubmission() {
  yield takeLatest(SUBMIT_IDEA_REQUEST, postIdea);
}

export default {
  watchLoadTopics,
  watchLoadAreas,
  watchLoadProjects,
  watchIdeaSubmission,
};
