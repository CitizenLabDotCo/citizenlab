/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { getUser, getUserIdeas } from '../sagas';
import { mergeJsonApiResources } from '../../../utils/resources/actions';
import { fetchIdeas, fetchUser } from '../../../api';
import { userIdeasLoaded, userLoaded } from '../actions';
import { stringMock } from '../../../utils/testConstants';

describe('UserShowPage sagas', () => {
  const userId = stringMock;
  const mockedAction = { userId };

  describe('getUser', () => {
    const it = sagaHelper(getUser(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchUser, userId));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources(undefined)));
    });

    it('then, should dispatch userLoaded action', (result) => {
      expect(result).toEqual(put(userLoaded(undefined)));
    });
  });

  describe('getUserIdeas', () => {
    const it = sagaHelper(getUserIdeas(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchIdeas, null, null, stringMock));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources(undefined)));
    });

    it('then, should dispatch userIdeasLoaded action', (result) => {
      expect(result).toEqual(put(userIdeasLoaded(undefined)));
    });
  });
});
