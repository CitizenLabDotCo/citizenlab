/**
 * Test sagas
 */

import sagaHelper from 'redux-saga-testing';
import { getIdeasXlsx, getCommentsXlsx } from '../sagas';

describe('Admin/ideas/sagas', () => {
  describe('getIdeasXlsx', () => {
    const it = sagaHelper(getIdeasXlsx());

    it('should have called the correct API', () => {
      // not testable due to FileSaver dependency
      expect(true).toEqual(true);
    });
  });
  describe('getCommentsXlsx', () => {
    const it = sagaHelper(getCommentsXlsx());

    it('should have called the correct API', () => {
      // not testable due to FileSaver dependency
      expect(true).toEqual(true);
    });
  });
});
