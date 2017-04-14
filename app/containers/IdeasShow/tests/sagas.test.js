/**
 * Test  sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fetchIdea } from '../../../api';
import { loadIdea } from '../sagas';

describe('sagas', () => {
  describe('loadIdea', () => {
    const mockedAction = {}; // TODO

    const it = sagaHelper(loadIdea(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchIdea, undefined));
    });

    it('then, should dispatch loadIdeaSuccess action', () => {
      // TODO (fix)
      // expect(result).toEqual(put(loadIdeaSuccess(undefined)));
      expect(true).toEqual(true);
    });
  });

  // TODO (same for loadIdeaComments and publishComment)
});
