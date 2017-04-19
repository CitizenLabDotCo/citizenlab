/**
 * Test  sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';


import { mergeJsonApiResources } from '../../../utils/resources/actions';
import { stringMock } from '../../../utils/testConstants';
import { getIdeaVotes, postIdeaVote } from '../sagas';
import { fetchIdeaVotes, submitIdeaVote } from '../../../api';
import { ideaVoted, votesLoaded } from '../actions';

describe('sagas', () => {
  describe('getIdeaVotes', () => {
    const mockedAction = {
      ideaId: stringMock,
    };
    const it = sagaHelper(getIdeaVotes(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchIdeaVotes, mockedAction.ideaId));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch votesLoaded action', (result) => {
      expect(result).toEqual(put(votesLoaded()));
    });
  });

  const testPostIdeaVote = (mode) => {
    const mockedAction = {
      ideaId: stringMock,
      mode,
    };

    const it = sagaHelper(postIdeaVote(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(submitIdeaVote, mockedAction.ideaId, mockedAction.mode));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadIdeaSuccess action', (result) => {
      expect(result).toEqual(put(ideaVoted()));
    });
  };

  describe('postIdeaVote', () => {
    describe('called with up vote', () => {
      testPostIdeaVote('up');
    });

    describe('called with down vote', () => {
      testPostIdeaVote('down');
    });
  });
});
