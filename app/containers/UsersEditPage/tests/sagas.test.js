/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { currentUserLoaded } from '../actions';
import { getProfile, postProfile } from '../sagas';
import { mergeJsonApiResources } from '../../../utils/resources/actions';
import { fetchCurrentUser, updateCurrentUser } from '../../../api';

describe('UserEditPage sagas', () => {
  const action = { userData: {} };

  describe('getProfile', () => {
    const it = sagaHelper(getProfile());

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchCurrentUser));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch currentUserLoaded action', (result) => {
      expect(result).toEqual(put(currentUserLoaded()));
    });
  });

  describe('postProfile', () => {
    const it = sagaHelper(postProfile(action));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(updateCurrentUser(action.userData), {
        method: 'POST',
        body: JSON.stringify(action.userData),
      }));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
        expect(result).toEqual(put(mergeJsonApiResources()));
    });

    // TODO: fix following test
    // it('then, should dispatch currentUserUpdated action', (result) => {
    //   expect(result).toEqual(put(currentUserUpdated(action.userData)));
    // });
  });
});
