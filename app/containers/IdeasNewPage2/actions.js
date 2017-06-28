import {
  LOAD_TOPICS_REQUEST,
  LOAD_PROJECTS_REQUEST,
  LOAD_TOPICS_SUCCESS,
  LOAD_PROJECTS_SUCCESS,
  SUBMIT_IDEA_REQUEST,
  SUBMIT_IDEA_SUCCESS,
} from './constants';

export function loadTopics() {
  return {
    type: LOAD_TOPICS_REQUEST,
  };
}

export function loadProjects() {
  return {
    type: LOAD_PROJECTS_REQUEST,
  };
}

export function topicsLoaded(topics) {
  return {
    type: LOAD_TOPICS_SUCCESS,
    payload: { topics },
  };
}

export function projectsLoaded(projects) {
  return {
    type: LOAD_PROJECTS_SUCCESS,
    payload: { projects },
  };
}

export function submitIdea(userId, title, description, topics, location, project, publicationStatus) {
  return {
    type: SUBMIT_IDEA_REQUEST,
    payload: { userId, title, description, topics, location, project, publicationStatus },
  };
}

export function ideaSubmitted(ideaId) {
  return {
    type: SUBMIT_IDEA_SUCCESS,
    payload: { ideaId },
  };
}
