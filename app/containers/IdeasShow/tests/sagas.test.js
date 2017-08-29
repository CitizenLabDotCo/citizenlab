/**
 * Test  sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { createIdeaComment, fetchIdea, fetchIdeaComments, fetchIdeaVotes, submitIdeaVote, deleteIdeaComment } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { stringMock } from 'utils/testing/constants';

import { getIdeaVotes, loadIdea, loadIdeaComments, postIdeaVote, publishCommentFlow, deleteComment } from '../sagas';
import { loadCommentsSuccess, voteIdeaSuccess, publishCommentSuccess, loadIdeaSuccess, loadVotesSuccess, deleteCommentSuccess } from '../actions';

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

    it('then, should dispatch loadVotesSuccess action', (result) => {
      expect(result).toEqual(put(loadVotesSuccess()));
    });
  });

  describe('loadIdea', () => {
    const mockedAction = {
      payload: {},
    };
    const it = sagaHelper(loadIdea(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchIdea, mockedAction.payload));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadIdeaSuccess action', (result) => {
      expect(result).toEqual(put(loadIdeaSuccess()));
    });
  });

  describe('loadIdeaComments', () => {
    const mockedAction = {
      nextCommentPageNumber: null,
      nextCommentPageItemCount: null,
      ideaId: 'anything',
    };

    const it = sagaHelper(loadIdeaComments(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchIdeaComments, mockedAction.nextCommentPageNumber, mockedAction.nextCommentPageItemCount, mockedAction.ideaId));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch commentsLoaded action', (result) => {
      expect(result).toEqual(put(loadCommentsSuccess()));
    });
  });

  describe('postIdeaVote', () => {
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
        expect(result).toEqual(put(voteIdeaSuccess()));
      });
    };

    describe('called with up vote', () => {
      testPostIdeaVote('up');
    });

    describe('called with down vote', () => {
      testPostIdeaVote('down');
    });
  });

  describe('publishComment', () => {
    const mockString = 'anything';
    const mockObject = {};

    const mockedAction = {
      ideaId: mockString,
      comment: mockObject,
      parentId: 1234,
    };

    const it = sagaHelper(publishCommentFlow(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(createIdeaComment, mockedAction.ideaId, mockedAction.comment, mockedAction.parentId));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(mergeJsonApiResources()));
    });

    it('then, should dispatch loadComments action', (result) => {
      expect(result).toEqual(put(publishCommentSuccess()));
    });
  });

  describe('deleteComment', () => {
    const mockId = 'asdfasdfasdf';

    const mockedAction = {
      commentId: mockId,
    };

    const commentId = mockedAction.commentId;
    const it = sagaHelper(deleteComment(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(deleteIdeaComment, commentId));
    });

    it('then, should dispatch mergeJsonApiResources action', (result) => {
      expect(result).toEqual(put(deleteCommentSuccess(commentId)));
    });
  });
});
