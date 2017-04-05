
import { fromJS } from 'immutable';
import ideasNewPageReducer, { ideasNewPageInitialState } from '../reducer';
import { attachmentStored, draftLoaded, draftStored, imageStored, loadDraft, setTitle } from '../actions';
import { randomString } from '../../../utils/testUtils';

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
  };

  it('returns the initial state', () => {
    const nextState = ideasNewPageReducer(ideasNewPageInitialState, {});
    expect(nextState).toEqual(fromJS(ideasNewPageInitialState));
  });

  it('should return draft.loading set to true, on loadDraft action', () => {
    const expectedState = initialState;
    expectedState.draft.loading = true;

    const nextState = ideasNewPageReducer(
      fromJS(ideasNewPageInitialState), loadDraft()
    );

    expect(nextState).toEqual(fromJS(expectedState));
  });

  it('should return draft.loading set to false and draft.content not null, on draftLoaded action', () => {
    const expectedState = initialState;
    expectedState.draft.loading = false;
    expectedState.draft.content = '<p></p>';

    const nextState = ideasNewPageReducer(
      fromJS(ideasNewPageInitialState), draftLoaded(expectedState.draft.content)
    );

    // draftLoaded
    expect(nextState).toEqual(fromJS(expectedState));
  });

  it('should return draft.stored set to true, on draftStored', () => {
    const expectedState = initialState;
    expectedState.draft.stored = true;

    const nextState = ideasNewPageReducer(
      fromJS(ideasNewPageInitialState), draftStored(expectedState.draft.content)
    ).toJS().draft.stored;

    // draftLoaded
    expect(nextState).toEqual(expectedState.draft.stored);
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

  it('should returns existing attachments on attachmentStored action', () => {
    const attachments = ['1'];
    const expectedState = initialState;
    expectedState.draft.attachments = attachments;

    const nextState = ideasNewPageReducer(
      fromJS(ideasNewPageInitialState), attachmentStored(attachments[0])
    ).toJS();

    expect(nextState.draft.attachments).toEqual(expectedState.draft.attachments);
  });

  it('should returns existing images on imageStored action', () => {
    const images = ['1'];
    const expectedState = initialState;
    expectedState.draft.images = images;

    const nextState = ideasNewPageReducer(
      fromJS(ideasNewPageInitialState), imageStored(images[0])
    ).toJS();

    expect(nextState.draft.images).toEqual(expectedState.draft.images);
  });
});
