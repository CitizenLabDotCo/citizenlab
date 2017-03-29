/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';

import request, { getCurrentUserRequest } from '../../../utils/request';
import { currentUserLoaded } from '../actions';
import { getProfile, postProfile } from '../sagas';
import { mergeJsonApiResources } from '../../../utils/resources/actions';

describe('UserEditPage sagas', () => {
  describe('getProfile', () => {
    const it = sagaHelper(getProfile());

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(getCurrentUserRequest));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch currentUserLoaded action', (result) => {
      expect(result).toEqual(put(currentUserLoaded()));
    });
  });

  describe('postProfile', () => {
    const action = { userData: {} };
    const it = sagaHelper(postProfile(action));

    it('should have called the correct API', (result) => {
      const requestURL = 'http://demo9193680.mockable.io/profile-post';
      expect(result).toEqual(call(request, requestURL, {
        method: 'POST',
        body: JSON.stringify(action.userData),
      }));
    });

    // TODO: fix following test
    // it('then, should dispatch profileStored action', (result) => {
    //   expect(result).toEqual(put(profileStored(action.userData)));
    // });
  });
});
