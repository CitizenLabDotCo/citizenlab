import { fromJS } from 'immutable';
import { randomString } from 'utils/testing/methods';
import { generateResourcesAreaValue } from 'utils/testing/mocks';

import ideasNewPageReducer, { ideasNewPageInitialState } from '../reducer';
import {
  loadAreasSuccess, loadTopicsSuccess,
  setTitle, storeAttachment, storeImage, storeSelectedAreas, storeSelectedTopics,
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
    },
    areas: {
      ids: [],
      selected: [],
    },
    projects: {
      ids: [],
      selected: [],
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

  describe('topics and areas', () => {
    const apiResponse = {
      data: [],
    };
    const expectedIds = [];
    for (let i = 0; i < 3; i += 1) {
      apiResponse.data[i] = generateResourcesAreaValue(i.toString()).data;
      expectedIds.push(i.toString());
    }

    describe('[AREAS|TOPICS]_LOAD_SUCCESS', () => {
      describe('LOAD_AREAS_SUCCESS', () => {
        it('should returns areas\' ids', () => {
          const expectedState = initialState;
          expectedState.areas.ids = expectedIds;

          const nextState = ideasNewPageReducer(
            fromJS(ideasNewPageInitialState), loadAreasSuccess(apiResponse)
          ).toJS();

          expect(nextState.areas.ids).toEqual(expectedState.areas.ids);
        });
      });

      describe('LOAD_TOPICS_SUCCESS', () => {
        it('should returns topics\' ids', () => {
          const expectedState = initialState;
          expectedState.topics.ids = expectedIds;

          const nextState = ideasNewPageReducer(
            fromJS(ideasNewPageInitialState), loadTopicsSuccess(apiResponse)
          ).toJS();

          expect(nextState.topics.ids).toEqual(expectedState.topics.ids);
        });
      });
    });

    describe('STORE_SELECTED_[AREAS|TOPICS]', () => {
      describe('STORE_SELECTED_AREAS', () => {
        it('should returns selected areas\' ids', () => {
          const expectedState = initialState;
          expectedState.areas.selected = expectedIds;

          const nextState = ideasNewPageReducer(
            fromJS(ideasNewPageInitialState), storeSelectedAreas(expectedIds)
          ).toJS();

          expect(nextState.areas.selected).toEqual(expectedState.areas.selected);
        });
      });

      describe('STORE_SELECTED_TOPICS', () => {
        it('should returns selected topics\' ids', () => {
          const expectedState = initialState;
          expectedState.topics.selected = expectedIds;

          const nextState = ideasNewPageReducer(
            fromJS(ideasNewPageInitialState), storeSelectedTopics(expectedIds)
          ).toJS();

          expect(nextState.topics.selected).toEqual(expectedState.topics.selected);
        });
      });
    });
  });
});
