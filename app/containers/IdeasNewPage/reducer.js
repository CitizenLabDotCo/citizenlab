/*
 *
 * IdeasNewPage reducer
 *
 */

import { fromJS } from 'immutable';
import {
  SAVE_DRAFT, PUBLISH_IDEA_REQUEST, PUBLISH_IDEA_ERROR, PUBLISH_IDEA_SUCCESS, SET_TITLE, STORE_ATTACHMENT,
  STORE_IMAGE, STORE_IMAGE_ERROR, STORE_ATTACHMENT_ERROR, LOAD_TOPICS_REQUEST, LOAD_AREAS_REQUEST, LOAD_TOPICS_SUCCESS,
  LOAD_TOPICS_ERROR, LOAD_AREAS_SUCCESS, LOAD_AREAS_ERROR, STORE_SELECTED_TOPICS, STORE_SELECTED_AREAS,
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
         // file names
        .updateIn(['draft', 'attachments'], (attachments) => attachments.concat(action.payload));
    case STORE_ATTACHMENT_ERROR:
      return state
        .setIn(['draft', 'storeAttachmentError'], true);
    case STORE_IMAGE:
      return state
        .setIn(['draft', 'storeImageError'], false)
         // image URLs
        .updateIn(['draft', 'images'], (images) => images.concat(action.payload));
    case STORE_IMAGE_ERROR:
      return state
        .setIn(['draft', 'storeImageError'], true);
    case LOAD_TOPICS_REQUEST:
      return state
        .setIn(['topics', 'loadError'], null)
        .setIn(['topics', 'loading'], true);
    case LOAD_TOPICS_SUCCESS: {
      const ids = action.payload.data.map((topic) => topic.id);

      return state
        .setIn(['topics', 'ids'], fromJS(ids))
        .setIn(['topics', 'loading'], false);
    }
    case LOAD_TOPICS_ERROR:
      return state
        .setIn(['topics', 'loadError'], action.error)
        .setIn(['topics', 'loading'], false);
    case LOAD_AREAS_REQUEST:
      return state
        .setIn(['areas', 'loadError'], null)
        .setIn(['areas', 'loading'], true);
    case LOAD_AREAS_SUCCESS: {
      const ids = action.payload.data.map((area) => area.id);

      return state
        .setIn(['areas', 'ids'], fromJS(ids))
        .setIn(['areas', 'loading'], false);
    }
    case LOAD_AREAS_ERROR:
      return state
        .setIn(['areas', 'loadError'], action.error)
        .setIn(['areas', 'loading'], false);
    case STORE_SELECTED_TOPICS:
      return state
        .setIn(['topics', 'selected'], fromJS(action.payload));
    case STORE_SELECTED_AREAS:
      return state
        .setIn(['areas', 'selected'], fromJS(action.payload));
    default:
      return state;
  }
}

export default ideasNewPageReducer;
