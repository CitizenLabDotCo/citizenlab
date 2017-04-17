/**
 * Test  sagas
 */


/* eslint-disable redux-saga/yield-effects */
import { call, put } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { createIdeaComment, fetchIdea, fetchIdeaComments } from '../../../api';
import { loadIdea, loadIdeaComments, publishComment } from '../sagas';
import { mergeJsonApiResources } from '../../../utils/resources/actions';
import { commentsLoaded, loadComments, loadIdeaSuccess } from '../actions';

describe('sagas', () => {
  describe('loadIdea', () => {
    const mockedAction = {
      payload: 'anything',
    };
    const it = sagaHelper(loadIdea(mockedAction));

    it('should have called the correct API', (result) => {
      expect(result).toEqual(call(fetchIdea, mockedAction.payload));
    });

    it('then, should dispatch loadIdeaSuccess action', (result) => {
      // TODO: fix this
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

    it('then, should dispatch loadIdeaSuccess action', (result) => {
      expect(result).toEqual(put(commentsLoaded()));
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
      expect(result).toEqual(put(loadComments(ideaId, null, null, true)));
    });
  });
});
