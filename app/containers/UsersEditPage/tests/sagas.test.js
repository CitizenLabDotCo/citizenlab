/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';

import request from '../../../utils/request';
import { profileLoaded, profileStored } from '../actions';
import { getProfile, postProfile } from '../sagas';

describe('UserEditPage sagas', () => {
  describe('getProfile', () => {
    const it = sagaHelper(getProfile());

    it('should have called the correct API', (result) => {
      const requestURL = 'http://demo9193680.mockable.io/profile-get';
      expect(result).toEqual(call(request, requestURL));
    });

    it('then, should dispatch profileLoaded action', (result) => {
      expect(result).toEqual(put(profileLoaded()));
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

    it('then, should dispatch profileStored action', (result) => {
      expect(result).toEqual(put(profileStored(action.userData)));
    });
  });
});
