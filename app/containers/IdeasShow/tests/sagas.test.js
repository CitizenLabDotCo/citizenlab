/**
 * Test  sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { createIdeaComment, fetchIdea, fetchIdeaComments, fetchIdeaVotes, submitIdeaVote, deleteIdeaComment } from 'api';

import { mergeJsonApiResources } from 'utils/resources/actions';
import { stringMock } from 'utils/testing/constants';

import { getIdeaVotes, loadIdea, loadIdeaComments, postIdeaVote, publishComment, deleteComment } from '../sagas';
import { loadCommentsSuccess, ideaVoted, publishCommentSuccess, loadIdeaSuccess, votesLoaded, deleteCommentSuccess } from '../actions';

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
        expect(result).toEqual(put(ideaVoted()));
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
      userId: mockString,
      htmlContents: mockObject,
      parentId: null,
    };
    const ideaId = mockedAction.ideaId;
    const it = sagaHelper(publishComment(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(createIdeaComment, ideaId, mockedAction.userId, mockedAction.htmlContents, mockedAction.parentId));
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
