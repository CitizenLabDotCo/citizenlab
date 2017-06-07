import {
  LOAD_TOPICS_REQUEST,
  LOAD_AREAS_REQUEST,
  LOAD_PROJECTS_REQUEST,
  LOAD_TOPICS_SUCCESS,
  LOAD_AREAS_SUCCESS,
  LOAD_PROJECTS_SUCCESS,
} from './constants';

export function loadTopics() {
  return {
    type: LOAD_TOPICS_REQUEST,
  };
}

export function loadAreas() {
  return {
    type: LOAD_AREAS_REQUEST,
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

export function areasLoaded(areas) {
  return {
    type: LOAD_AREAS_SUCCESS,
    payload: { areas },
  };
}

export function projectsLoaded(projects) {
  return {
    type: LOAD_PROJECTS_SUCCESS,
    payload: { projects },
  };
}
