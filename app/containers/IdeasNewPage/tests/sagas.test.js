/**
 * Test  sagas
 */

/* eslint-disable redux-saga/yield-effects */
import { put, call } from 'redux-saga/effects';
import sagaHelper from 'redux-saga-testing';

import request from '../../../utils/request';
import { getAttachments, getDraft, getImages, postAttachment, postDraft, postIdea, postImage } from '../sagas'; // eslint-disable-line no-unused-vars
import {
  attachmentsLoaded, attachmentStored, draftLoaded, draftStored, ideaStored, imagesLoaded, imageStored, // eslint-disable-line no-unused-vars
} from '../actions';

describe('IdeasNewPage sagas', () => {
  describe('getDraft', () => {
    const it = sagaHelper(getDraft());

    it('should have called the correct API', (result) => {
      const requestURL = 'http://localhost:3030/draft-get-html';
      expect(result).toEqual(call(request, requestURL));
    });

    it('then, should dispatch draftLoaded action', (result) => {
      expect(result).toEqual(put(draftLoaded()));
    });
  });

  describe('postDraft', () => {
    const action = { draft: '<p></p>' };
    const it = sagaHelper(postDraft(action));

    it('should have called the correct API', (result) => {
      const requestURL = 'http://demo9193680.mockable.io/draft-post';
      expect(result).toEqual(call(request, requestURL, {
        method: 'POST',
        body: JSON.stringify(action.draft),
      }));
    });

    it('then, should dispatch draftStored action', (result) => {
      expect(result).toEqual(put(draftStored()));
    });
  });

  describe('getAttachments', () => {
    const it = sagaHelper(getAttachments());

    it('should have called the correct API', (result) => {
      const requestURL = 'http://demo9193680.mockable.io/attachments-get';
      expect(result).toEqual(call(request, requestURL));
    });

    it('then, should dispatch attachmentsLoaded action', (result) => {
      expect(result).toEqual(put(attachmentsLoaded()));
    });
  });

  describe('postAttachment', () => {
    const source = new File([''], 'filename');
    const action = { source };

    const payload = new FormData();
    payload.append('file', action.source);

    const it = sagaHelper(postAttachment(action));

    it('should have called the correct API', (result) => {
      const requestURL = 'http://cl2-mock.getsandbox.com/post-attachment';
      expect(result).toEqual(call(request, requestURL, {
        method: 'POST',
        body: payload,
      }));
    });

    // TODO: fix following test
    // const response = { source: '1' };
    // it('then, should dispatch attachmentStored action', (result) => {
    //   expect(result).toEqual(put(attachmentStored(response.source)));
    // });
  });

  describe('getImages', () => {
    const it = sagaHelper(getImages());

    it('should have called the correct API', (result) => {
      const requestURL = 'http://demo9193680.mockable.io/images-get';
      expect(result).toEqual(call(request, requestURL));
    });

    it('then, should dispatch imagesLoaded action', (result) => {
      expect(result).toEqual(put(imagesLoaded()));
    });
  });

  describe('postImage', () => {
    const source = new File([''], 'filename');
    const action = { source };

    const payload = new FormData();
    payload.append('file', action.source);

    const it = sagaHelper(postImage(action));

    it('should have called the correct API', (result) => {
      const requestURL = 'http://demo9193680.mockable.io/image-post';
      expect(result).toEqual(call(request, requestURL, {
        method: 'POST',
        body: payload,
      }));
    });

    // TODO: fix following test
    // const response = { source: '1' };
    // it('then, should dispatch imageStored action', (result) => {
    //   expect(result).toEqual(put(imageStored(response.source)));
    // });
  });


  // describe('postIdea', () => {
  //   const action = { idea: '<p></p>' };
  //   const it = sagaHelper(postIdea(action));
  //
  //   it('should have called the correct API', (result) => {
  //     const requestURL = 'http://localhost:3030/idea-post';
  //     expect(result).toEqual(call(request, requestURL, {
  //       method: 'POST',
  //       body: JSON.stringify(action.idea),
  //     }));
  //   });
  //
  //   it('then, should dispatch ideaStored action', (result) => {
  //     expect(result).toEqual(put(ideaStored()));
  //   });
  // });
});
