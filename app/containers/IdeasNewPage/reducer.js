/*
 *
 * IdeasNewPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  SAVE_DRAFT, PUBLISH_IDEA_REQUEST, PUBLISH_IDEA_ERROR, PUBLISH_IDEA_SUCCESS, SET_TITLE, STORE_ATTACHMENT,
  STORE_IMAGE, STORE_IMAGE_ERROR, STORE_ATTACHMENT_ERROR,
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
    case SAVE_DRAFT:
      return state
        .setIn(['draft', 'loadError'], false)
        .setIn(['draft', 'storeError'], false)
        .setIn(['draft', 'content'], action.draft);
    case PUBLISH_IDEA_REQUEST:
      return state
        .setIn(['draft', 'loadError'], false)
        .setIn(['draft', 'storeError'], false)
        .setIn(['draft', 'submitting'], true)
        .setIn(['draft', 'submitted'], false)
        .setIn(['draft', 'submitError'], false);
    case PUBLISH_IDEA_ERROR:
      return state
        .setIn(['draft', 'submitting'], false)
        .setIn(['draft', 'submitError'], true);
    case PUBLISH_IDEA_SUCCESS:
      return state
        .setIn(['draft', 'submitting'], false)
        .setIn(['draft', 'submitted'], true);
    case SET_TITLE:
      return state
        .setIn(['draft', 'title'], action.payload)
        .setIn(['draft', 'shortTitleError'], action.payload.length < 5)
        .setIn(['draft', 'longTitleError'], action.payload.length > 120)
        .setIn(['draft', 'titleLength'], action.payload.length);
    case STORE_ATTACHMENT:
      return state
        .setIn(['draft', 'storeAttachmentError'], false)
        .updateIn(['draft', 'attachments'], (attachments) => attachments.concat(action.payload));
    case STORE_ATTACHMENT_ERROR:
      return state
        .setIn(['draft', 'storeAttachmentError'], true);
    case STORE_IMAGE:
      return state
        .setIn(['draft', 'storeImageError'], false)
        .updateIn(['draft', 'images'], (images) => images.concat(action.payload));
    case STORE_IMAGE_ERROR:
      return state
        .setIn(['draft', 'storeImageError'], true);
    default:
      return state;
  }
}

export default ideasNewPageReducer;
