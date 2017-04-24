/*
 *
 * IdeasNewPage actions
 *
 */
import {
  SAVE_DRAFT, PUBLISH_IDEA_ERROR, PUBLISH_IDEA_SUCCESS, PUBLISH_IDEA, SET_TITLE, STORE_ATTACHMENT, STORE_IMAGE, STORE_ATTACHMENT_ERROR, STORE_IMAGE_ERROR,
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
    type: PUBLISH_IDEA,
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
