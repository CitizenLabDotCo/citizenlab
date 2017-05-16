import {
  LOAD_IDEAS_REQUEST, LOAD_IDEAS_SUCCESS, LOAD_IDEAS_ERROR,
  LOAD_TOPICS_REQUEST, LOAD_TOPICS_SUCCESS, LOAD_TOPICS_ERROR,
  LOAD_AREAS_REQUEST, LOAD_AREAS_SUCCESS, LOAD_AREAS_ERROR,
} from './constants';

export function loadIdeas(nextPageNumber, nextPageItemCount, pageCount, initialLoad = false) {
  return {
    type: LOAD_IDEAS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
    pageCount,
    initialLoad,
  };
}

export function loadIdeasSuccess(ideas, topics, areas, pageCount, initialLoad) {
  return {
    type: LOAD_IDEAS_SUCCESS,
    payload: { ideas, pageCount, initialLoad },
  };
}

export function loadIdeasError(error) {
  return {
    type: LOAD_IDEAS_ERROR,
    payload: error,
  };
}

export function loadTopics() {
  return {
    type: LOAD_TOPICS_REQUEST,
  };
}

export function loadTopicsSuccess(topics) {
  return {
    type: LOAD_TOPICS_SUCCESS,
    payload: topics,
  };
}

export function loadTopicsError(error) {
  return {
    type: LOAD_TOPICS_ERROR,
    payload: error,
  };
}

export function loadAreas() {
  return {
    type: LOAD_AREAS_REQUEST,
  };
}

export function loadAreasSuccess(areas) {
  return {
    type: LOAD_AREAS_SUCCESS,
    payload: areas,
  };
}

export function loadAreasError(error) {
  return {
    type: LOAD_AREAS_ERROR,
    payload: error,
  };
}
