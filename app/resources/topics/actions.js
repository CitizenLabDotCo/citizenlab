/*
 *
 * resources/topics actions
 *
 */

import {
  LOAD_TOPICS_ERROR, LOAD_TOPICS_REQUEST, LOAD_TOPICS_SUCCESS, RESET_TOPICS, LOAD_TOPIC_REQUEST, LOAD_TOPIC_SUCCESS, LOAD_TOPIC_ERROR, DELETE_TOPIC_REQUEST, DELETE_TOPIC_SUCCESS, DELETE_TOPIC_ERROR, CREATE_TOPIC_SUCCESS } from './constants';

export function loadTopicsRequest(nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_TOPICS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function loadTopicsSuccess(response) {
  return {
    type: LOAD_TOPICS_SUCCESS,
    payload: response,
  };
}

export function loadTopicsError(error) {
  return {
    type: LOAD_TOPICS_ERROR,
    error,
  };
}

export function loadTopicRequest(id) {
  return {
    type: LOAD_TOPIC_REQUEST,
    id,
  };
}

export function loadTopicSuccess(response) {
  return {
    type: LOAD_TOPIC_SUCCESS,
    payload: response,
  };
}

export function loadTopicError(error) {
  return {
    type: LOAD_TOPIC_ERROR,
    error,
  };
}

export function createTopicSuccess(response) {
  return {
    type: CREATE_TOPIC_SUCCESS,
    payload: response,
  };
}

export function deleteTopicRequest(id) {
  return {
    type: DELETE_TOPIC_REQUEST,
    id,
  };
}

export function deleteTopicSuccess(id) {
  return {
    type: DELETE_TOPIC_SUCCESS,
    id,
  };
}

export function deleteTopicError(error) {
  return {
    type: DELETE_TOPIC_ERROR,
    error,
  };
}

export function resetTopics() {
  return {
    type: RESET_TOPICS,
  };
}
