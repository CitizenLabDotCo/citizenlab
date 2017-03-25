/*
 *
 * IdeasNewPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  LOAD_DRAFT, LOAD_DRAFT_ERROR, LOAD_DRAFT_SUCCESS, STORE_DRAFT, STORE_DRAFT_SUCCESS, STORE_DRAFT_ERROR,
  SAVE_DRAFT, STORE_IDEA, STORE_IDEA_ERROR, STORE_IDEA_SUCCESS, SET_TITLE, STORE_ATTACHMENT, STORE_ATTACHMENT_SUCCESS,
  STORE_ATTACHMENT_ERROR, LOAD_ATTACHMENTS, LOAD_ATTACHMENTS_SUCCESS, LOAD_ATTACHMENTS_ERROR, STORE_IMAGE,
  STORE_IMAGE_SUCCESS, STORE_IMAGE_ERROR, LOAD_IMAGES, LOAD_IMAGES_SUCCESS, LOAD_IMAGES_ERROR,
} from './constants';

export const ideasNewPageInitialState = fromJS({
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
});

function ideasNewPageReducer(state = ideasNewPageInitialState, action) {
  switch (action.type) {
    case LOAD_DRAFT:
      return state
        .setIn(['draft', 'loading'], true)
        .setIn(['draft', 'loadError'], false);
    case LOAD_DRAFT_SUCCESS:
      return state
        .setIn(['draft', 'content'], action.content)
        .setIn(['draft', 'loading'], false);
    case LOAD_DRAFT_ERROR:
      return state
        .setIn(['draft', 'loadError'], true)
        .setIn(['draft', 'loading'], false);
    case STORE_DRAFT:
      return state
        .setIn(['draft', 'stored'], false)
        .setIn(['draft', 'storeError'], false);
    case STORE_DRAFT_SUCCESS:
      return state
        .setIn(['draft', 'stored'], true)
        .setIn(['draft', 'storeError'], false);
    case STORE_DRAFT_ERROR:
      return state
        .setIn(['draft', 'stored'], false)
        .setIn(['draft', 'storeError'], true);
    case SAVE_DRAFT:
      return state
        .setIn(['draft', 'content'], action.draft);
    case STORE_IDEA:
      return state
        .setIn(['draft', 'submitting'], true)
        .setIn(['draft', 'submitted'], false)
        .setIn(['draft', 'submitError'], false);
    case STORE_IDEA_ERROR:
      return state
        .setIn(['draft', 'submitting'], false)
        .setIn(['draft', 'submitError'], true);
    case STORE_IDEA_SUCCESS:
      return state
        .setIn(['draft', 'submitting'], false)
        .setIn(['draft', 'submitted'], true);
    case SET_TITLE:
      return state
        .setIn(['draft', 'title'], action.title)
        .setIn(['draft', 'shortTitleError'], action.title.length < 5)
        .setIn(['draft', 'longTitleError'], action.title.length > 120)
        .setIn(['draft', 'titleLength'], action.title.length);
    case STORE_ATTACHMENT:
      return state
        .setIn(['draft', 'loadAttachmentsError'], false)
        .setIn(['draft', 'storeAttachmentError'], false);
    case STORE_ATTACHMENT_SUCCESS:
      return state
        .setIn(['draft', 'attachments'], fromJS(state.getIn(['draft', 'attachments'])).concat(action.source))
        .setIn(['draft', 'storeAttachmentError'], false);
    case STORE_ATTACHMENT_ERROR:
      return state
        .setIn(['draft', 'storeAttachmentError'], true);
    case LOAD_ATTACHMENTS:
      return state
        .setIn(['draft', 'loadAttachmentsError'], false);
    case LOAD_ATTACHMENTS_SUCCESS:
      return state
        .setIn(['draft', 'attachments'], action.sources)
        .setIn(['draft', 'loadAttachmentsError'], false);
    case LOAD_ATTACHMENTS_ERROR:
      return state
        .setIn(['draft', 'loadAttachmentsError'], true);
    case STORE_IMAGE:
      return state
        .setIn(['draft', 'loadImagesError'], false)
        .setIn(['draft', 'storeImageError'], false);
    case STORE_IMAGE_SUCCESS:
      return state
        .setIn(['draft', 'images'], fromJS(state.getIn(['draft', 'images'])).concat(action.source))
        .setIn(['draft', 'storeImageError'], false);
    case STORE_IMAGE_ERROR:
      return state
        .setIn(['draft', 'storeImageError'], true);
    case LOAD_IMAGES:
      return state
        .setIn(['draft', 'loadImagesError'], false);
    case LOAD_IMAGES_SUCCESS:
      return state
        .setIn(['draft', 'images'], action.sources)
        .setIn(['draft', 'loadImagesError'], false);
    case LOAD_IMAGES_ERROR:
      return state
        .setIn(['draft', 'loadImagesError'], true);
    default:
      return state;
  }
}

export default ideasNewPageReducer;
