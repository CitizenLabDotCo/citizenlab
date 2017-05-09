
import { fromJS } from 'immutable';
import { randomString } from 'utils/testing/methods';

import ideasNewPageReducer, { ideasNewPageInitialState } from '../reducer';
import {
  setTitle, storeAttachment, storeImage,
} from '../actions';

describe('ideasNewPageReducer', () => {
  const initialState = {
    draft: {
      loading: false,
      loadError: false,
      storeError: false,
      loaded: false,
      stored: false,
      submitted: false,
      submitError: false,
      submitting: false,
      content: null,
      title: '',
      shortTitleError: true,
      longTitleError: false,
      titleLength: 0,
      attachments: [],
      loadAttachmentsError: false,
      storeAttachmentError: false,
      images: [],
      loadImagesError: false,
      storeImageError: false,
    },
    topics: {
      ids: [],
      selected: [],
      loadError: null,
      loading: false,
    },
    areas: {
      ids: [],
      selected: [],
      loadError: null,
      loading: false,
    },
  };

  it('returns the initial state', () => {
    const nextState = ideasNewPageReducer(initialState, {});
    expect(nextState).toEqual(initialState);
  });

  it('should set shortTitleError to true if title < 5 chars', () => {
    const expectedState = initialState;
    expectedState.draft.shortTitleError = true;

    const title = 'titl';
    const nextState = ideasNewPageReducer(
      fromJS(ideasNewPageInitialState), setTitle(title)
    ).toJS().draft.shortTitleError;

    // draftLoaded
    expect(nextState).toEqual(expectedState.draft.shortTitleError);
  });

  it('should set longTitleError to true if title > 120 chars', () => {
    const expectedState = initialState;
    expectedState.draft.longTitleError = true;

    const title = randomString(121);
    const nextState = ideasNewPageReducer(
      fromJS(ideasNewPageInitialState), setTitle(title)
    ).toJS().draft.longTitleError;

    // draftLoaded
    expect(nextState).toEqual(expectedState.draft.longTitleError);
  });

  it('should returns existing attachments on storeAttachment action', () => {
    const attachments = ['1'];
    const expectedState = initialState;
    expectedState.draft.attachments = attachments;

    const nextState = ideasNewPageReducer(
      fromJS(ideasNewPageInitialState), storeAttachment(attachments[0])
    ).toJS();

    expect(nextState.draft.attachments).toEqual(expectedState.draft.attachments);
  });

  it('should returns existing images on storeImage action', () => {
    const images = ['1'];
    const expectedState = initialState;
    expectedState.draft.images = images;

    const nextState = ideasNewPageReducer(
      fromJS(ideasNewPageInitialState), storeImage(images[0])
    ).toJS();

    expect(nextState.draft.images).toEqual(expectedState.draft.images);
  });
});
