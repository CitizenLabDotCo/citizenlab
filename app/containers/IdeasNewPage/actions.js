/*
 *
 * IdeasNewPage actions
 *
 */
import {
  SAVE_DRAFT, PUBLISH_IDEA_ERROR, PUBLISH_IDEA_SUCCESS, PUBLISH_IDEA_REQUEST, SET_TITLE, STORE_ATTACHMENT, STORE_IMAGE,
  STORE_ATTACHMENT_ERROR, STORE_IMAGE_ERROR, LOAD_TOPICS_REQUEST, LOAD_TOPICS_SUCCESS, LOAD_TOPICS_ERROR,
  LOAD_AREAS_REQUEST, LOAD_AREAS_SUCCESS, LOAD_AREAS_ERROR,
} from './constants';

/*
 *
 * IdeasNewPage actions
 *
 */


// store draft in redux store
export function saveDraft(content) {
  return {
    type: SAVE_DRAFT,
    draft: content,
  };
}

export function publishIdeaRequest(contents, titles, images, attachments, userId, isDraft) {
  return {
    type: PUBLISH_IDEA_REQUEST,
    payload: contents,
    titles,
    images,
    attachments,
    userId,
    isDraft,
  };
}

export function publishIdeaSuccess() {
  return {
    type: PUBLISH_IDEA_SUCCESS,
  };
}

export function publishIdeaError() {
  return {
    type: PUBLISH_IDEA_ERROR,
  };
}

export function setTitle(title) {
  return {
    type: SET_TITLE,
    payload: title,
  };
}

export function storeAttachment(file) {
  return {
    type: STORE_ATTACHMENT,
    payload: file,
  };
}

export function storeAttachmentError() {
  return {
    type: STORE_ATTACHMENT_ERROR,
  };
}

export function storeImage(image) {
  return {
    type: STORE_IMAGE,
    payload: image,
  };
}

export function storeImageError() {
  return {
    type: STORE_IMAGE_ERROR,
  };
}

export function loadTopicsRequest() {
  return {
    type: LOAD_TOPICS_REQUEST,
  };
}

export function loadTopicsSuccess(response) {
  return {
    type: LOAD_TOPICS_SUCCESS,
    payload: response,
  };
}

export function loadTopicsError(error) {
  return {
    type: LOAD_TOPICS_ERROR,
    error,
  };
}

export function loadAreasRequest() {
  return {
    type: LOAD_AREAS_REQUEST,
  };
}

export function loadAreasSuccess(response) {
  return {
    type: LOAD_AREAS_SUCCESS,
    payload: response,
  };
}

export function loadAreasError(error) {
  return {
    type: LOAD_AREAS_ERROR,
    error,
  };
}