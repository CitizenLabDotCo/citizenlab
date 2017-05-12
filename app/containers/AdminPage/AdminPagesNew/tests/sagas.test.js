/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
// import { put, call } from 'redux-saga/effects';
// import sagaHelper from 'redux-saga-testing';
// import { mergeJsonApiResources } from 'utils/resources/actions';
import { localStorageMock } from 'utils/testing/methods';

describe('AdminPages sagas', () => {
  // mock localStorage
  Object.defineProperty(window, 'localStorage', { value: localStorageMock() });

  it('it should have tests in the future', () => {
    expect(true).toEqual(true);
    // TODO: complete with sagas tests
  });
});
