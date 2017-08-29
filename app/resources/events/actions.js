/*
 *
 * resources/events actions
 *
 */

import {
  LOAD_EVENTS_ERROR, LOAD_EVENTS_REQUEST, LOAD_EVENTS_SUCCESS, RESET_EVENTS, LOAD_EVENT_REQUEST, LOAD_EVENT_SUCCESS, LOAD_EVENT_ERROR, DELETE_EVENT_REQUEST, DELETE_EVENT_SUCCESS, DELETE_EVENT_ERROR, CREATE_EVENT_SUCCESS } from './constants';

export function loadEventsRequest(nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_EVENTS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function loadEventsSuccess(response) {
  return {
    type: LOAD_EVENTS_SUCCESS,
    payload: response,
  };
}

export function loadEventsError(error) {
  return {
    type: LOAD_EVENTS_ERROR,
    error,
  };
}

export function loadEventRequest(id) {
  return {
    type: LOAD_EVENT_REQUEST,
    id,
  };
}

export function loadEventSuccess(response) {
  return {
    type: LOAD_EVENT_SUCCESS,
    payload: response,
  };
}

export function loadEventError(error) {
  return {
    type: LOAD_EVENT_ERROR,
    error,
  };
}

export function createEventSuccess(response) {
  return {
    type: CREATE_EVENT_SUCCESS,
    payload: response,
  };
}

export function deleteEventRequest(id) {
  return {
    type: DELETE_EVENT_REQUEST,
    id,
  };
}

export function deleteEventSuccess(id) {
  return {
    type: DELETE_EVENT_SUCCESS,
    id,
  };
}

export function deleteEventError(error) {
  return {
    type: DELETE_EVENT_ERROR,
    error,
  };
}

export function resetEvents() {
  return {
    type: RESET_EVENTS,
  };
}
