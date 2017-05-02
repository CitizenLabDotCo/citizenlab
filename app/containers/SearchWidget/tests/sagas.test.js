/**
 * Test  sagas
 */

import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fetchIdeas } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';

import { getIdeasFiltered } from '../sagas';
import { searchIdeasSuccess } from '../actions';

describe('SearchWidget sagas', () => {
  describe('getIdeasFiltered', () => {
    const action = {
      payload: {},
    };

    const it = sagaHelper(getIdeasFiltered(action));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchIdeas, {
        search: action.payload,
      }));
    });

    it('then should dispatch mergeJsonApiResources', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch searchIdeasSuccess action', (result) => {
      expect(result).toEqual(put(searchIdeasSuccess()));
    });
  });
});
