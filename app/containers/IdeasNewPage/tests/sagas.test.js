/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
// import { fromJS } from 'immutable';
import { createIdea } from 'api';
import { mergeJsonApiResources } from 'utils/resources/actions';
import { arrayMock, stringMock } from 'utils/testing/constants';

import { getIdeaRequestContent, postIdea } from '../sagas';
import { publishIdeaSuccess } from '../actions';

describe('IdeasNewPage sagas', () => {
  describe('postIdea', () => {
    const testSubmitIdea = (isDraft) => {
      const action = {
        userId: stringMock,
        titles: {
          en: stringMock,
        },
        payload: {
          en: stringMock,
        },
        images: arrayMock,
        // attachments: fromJS(arrayMock),
        topics: arrayMock,
        areas: arrayMock,
        projects: arrayMock,
        isDraft,
      };
      const it = sagaHelper(postIdea(action));

      it('should have called the correct API', (result) => {
        const { payload, titles, images, /* attachments, */ userId, topics, areas, projects } = action;
        const requestBody = getIdeaRequestContent(payload, titles, images, /* attachments, */ userId, isDraft, topics, areas, projects);
        expect(result).toEqual(call(createIdea, requestBody));
      });

      it('then should dispatch mergeJsonApiResources', (result) => {
        expect(result).toEqual(put(mergeJsonApiResources()));
      });

      it('then, should dispatch publishIdeaSuccess action', (result) => {
        expect(result).toEqual(put(publishIdeaSuccess()));
      });
    };

    describe('publish', () => {
      testSubmitIdea(false);
    });

    describe('save as draft', () => {
      testSubmitIdea(true);
    });
  });
});
