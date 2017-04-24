/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';
import { fromJS } from 'immutable';

import { getIdeaRequestContent, postIdea } from '../sagas';
import { publishIdeaSuccess } from '../actions';
import { createIdea } from '../../../api';
import { mergeJsonApiResources } from '../../../utils/resources/actions';
import { arrayMock, stringMock } from '../../../utils/testConstants'; // eslint-disable-line no-unused-vars

describe('IdeasNewPage sagas', () => {
  describe('postIdea', () => {
    describe('publish', () => {
      const action = {
        userId: stringMock,
        titles: {
          en: stringMock,
        },
        payload: {
          en: stringMock,
        },
        images: arrayMock,
        attachments: fromJS(arrayMock),
      };
      const it = sagaHelper(postIdea(action));

      it('should have called the correct API', (result) => {
        const { payload, titles, images, attachments, userId } = action;
        const requestBody = getIdeaRequestContent(payload, titles, images, attachments, userId, false);
        expect(result).toEqual(call(createIdea, requestBody));
      });

      it('then should dispatch mergeJsonApiResources', (result) => {
        expect(result).toEqual(put(mergeJsonApiResources()));
      });

      it('then, should dispatch ideaPublished action', (result) => {
        expect(result).toEqual(put(publishIdeaSuccess()));
      });
    });
  });
});
