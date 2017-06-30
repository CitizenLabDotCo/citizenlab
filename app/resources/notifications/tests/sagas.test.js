/**
 * Test sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { stringMock, mockNumber } from 'utils/testing/constants';
import { loadNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../sagas';
import { loadNotificationsSuccess, markAllNotificationsAsReadSuccess, markNotificationAsReadSuccess } from '../actions';

describe('resources/notifications sagas', () => {
  describe('loadPagesSaga', () => {
    const mockedAction = {
      nextPageNumber: mockNumber,
      nextPageItemCount: mockNumber,
    };
    const it = sagaHelper(loadNotifications(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchNotifications, {
        'page[number]': mockedAction.nextPageNumber,
        'page[size]': mockedAction.nextPageItemCount,
      }));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadNotificationsSuccess action', (result) => {
      expect(result).toEqual(put(loadNotificationsSuccess()));
    });
  });

  describe('markNotificationAsRead', () => {
    const mockedAction = {
      payload: stringMock,
    };
    const it = sagaHelper(markNotificationAsRead(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(markNotificationRead, mockedAction.payload));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadNotificationsSuccess action', (result) => {
      expect(result).toEqual(put(markNotificationAsReadSuccess()));
    });
  });

  describe('markAllNotificationsAsRead', () => {
    const it = sagaHelper(markAllNotificationsAsRead());

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(markAllNotificationsRead));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadNotificationsSuccess action', (result) => {
      expect(result).toEqual(put(markAllNotificationsAsReadSuccess()));
    });
  });
});
