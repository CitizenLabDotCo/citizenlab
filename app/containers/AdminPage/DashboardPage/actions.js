/*
 *
 * AdminPage/DashboardPage actions
 *
 */

import {
  LOAD_USERS_REPORT_REQUEST, LOAD_USERS_REPORT_SUCCESS, LOAD_USERS_REPORT_ERROR, LOAD_IDEA_TOPICS_REPORT_REQUEST,
  LOAD_IDEA_TOPICS_REPORT_SUCCESS, LOAD_IDEA_TOPICS_REPORT_ERROR, LOAD_IDEA_AREAS_REPORT_REQUEST,
  LOAD_IDEA_AREAS_REPORT_SUCCESS, LOAD_IDEA_AREAS_REPORT_ERROR,
} from './constants';

export function loadUsersReportRequest(startAt, endAt, interval) {
  return {
    type: LOAD_USERS_REPORT_REQUEST,
    startAt,
    endAt,
    interval,
  };
}

export function loadUsersReportSuccess(response) {
  return {
    type: LOAD_USERS_REPORT_SUCCESS,
    payload: response,
  };
}

export function loadUsersReportError(error) {
  return {
    type: LOAD_USERS_REPORT_ERROR,
    payload: error,
  };
}

export function loadIdeaTopicsReportRequest(startAt, endAt) {
  return {
    type: LOAD_IDEA_TOPICS_REPORT_REQUEST,
    startAt,
    endAt,
  };
}

export function loadIdeaTopicsReportSuccess(response) {
  return {
    type: LOAD_IDEA_TOPICS_REPORT_SUCCESS,
    payload: {
      values: response.data,
      labels: response.topics,
    },
  };
}

export function loadIdeaTopicsReportError(error) {
  return {
    type: LOAD_IDEA_TOPICS_REPORT_ERROR,
    payload: error,
  };
}


export function loadIdeaAreasReportRequest(startAt, endAt) {
  return {
    type: LOAD_IDEA_AREAS_REPORT_REQUEST,
    startAt,
    endAt,
  };
}

export function loadIdeaAreasReportSuccess(response) {
  return {
    type: LOAD_IDEA_AREAS_REPORT_SUCCESS,
    payload: {
      values: response.data,
      labels: response.areas,
    },
  };
}

export function loadIdeaAreasReportError(error) {
  return {
    type: LOAD_IDEA_AREAS_REPORT_ERROR,
    payload: error,
  };
}
