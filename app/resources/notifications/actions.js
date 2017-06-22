/*
 *
 * resources/notifications actions
 *
 */

import {
  LOAD_NOTIFICATIONS_ERROR, LOAD_NOTIFICATIONS_REQUEST, LOAD_NOTIFICATIONS_SUCCESS,
  MARK_NOTIFICATION_READ_ERROR, MARK_NOTIFICATION_READ_REQUEST, MARK_NOTIFICATION_READ_SUCCESS,
  MARK_ALL_NOTIFICATIONS_READ_ERROR, MARK_ALL_NOTIFICATIONS_READ_REQUEST, MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
} from './constants';

export function loadNotificationsRequest(nextPageNumber, nextPageItemCount) {
  return {
    type: LOAD_NOTIFICATIONS_REQUEST,
    nextPageNumber,
    nextPageItemCount,
  };
}

export function loadNotificationsSuccess(response) {
  return {
    type: LOAD_NOTIFICATIONS_SUCCESS,
    payload: response,
  };
}

export function loadNotificationsError(error) {
  return {
    type: LOAD_NOTIFICATIONS_ERROR,
    error,
  };
}

export function markNotificationAsReadRequest(notificationId) {
  return {
    type: MARK_NOTIFICATION_READ_REQUEST,
    payload: notificationId,
  };
}

export function markNotificationAsReadSuccess(response) {
  return {
    type: MARK_NOTIFICATION_READ_SUCCESS,
    payload: response,
  };
}

export function markNotificationAsReadError(error) {
  return {
    type: MARK_NOTIFICATION_READ_ERROR,
    error,
  };
}

export function markAllNotificationsAsReadRequest() {
  return {
    type: MARK_ALL_NOTIFICATIONS_READ_REQUEST,
  };
}

export function markAllNotificationsAsReadSuccess(response) {
  return {
    type: MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
    payload: response,
  };
}

export function markAllNotificationsAsReadError(error) {
  return {
    type: MARK_ALL_NOTIFICATIONS_READ_ERROR,
    error,
  };
}
