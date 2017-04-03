/*
 *
 * IdeasNewPage actions
 *
 */
import {
  STORE_DRAFT_SUCCESS, STORE_DRAFT, STORE_DRAFT_ERROR, LOAD_DRAFT, LOAD_DRAFT_SUCCESS, LOAD_DRAFT_ERROR,
  SAVE_DRAFT, STORE_IDEA_ERROR, STORE_IDEA_SUCCESS, STORE_IDEA, SET_TITLE, STORE_ATTACHMENT, STORE_IMAGE, STORE_ATTACHMENT_ERROR, STORE_IMAGE_ERROR,
} from './constants';

/*
 *
 * IdeasNewPage actions
 *
 */

export function loadDraft() {
  return {
    type: LOAD_DRAFT,
  };
}

export function draftLoaded(content) {
  return {
    type: (content ? LOAD_DRAFT_SUCCESS : LOAD_DRAFT_ERROR),
    content,
  };
}

export function loadDraftError() {
  return {
    type: LOAD_DRAFT_ERROR,
  };
}

// send draft to backend
export function storeDraft(content) {
  return {
    type: STORE_DRAFT,
    draft: content,
  };
}

export function draftStored() {
  return {
    type: STORE_DRAFT_SUCCESS,
  };
}

export function storeDraftError() {
  return {
    type: STORE_DRAFT_ERROR,
  };
}

// store draft in redux store
export function saveDraft(content) {
  return {
    type: SAVE_DRAFT,
    draft: content,
  };
}

export function publishIdea(contents, titles, images, attachments, userId) {
  return {
    type: STORE_IDEA,
    contents,
    titles,
    images,
    attachments,
    userId,
  };
}

export function ideaPublished() {
  return {
    type: STORE_IDEA_SUCCESS,
  };
}

export function publishIdeaError() {
  return {
    type: STORE_IDEA_ERROR,
  };
}

export function setTitle(title) {
  return {
    type: SET_TITLE,
    title,
  };
}

export function storeAttachment(file) {
  return {
    type: STORE_ATTACHMENT,
    source: file,
  };
}

export function storeAttachmentError() {
  return {
    type: STORE_ATTACHMENT_ERROR,
  };
}

export function storeImage(file) {
  return {
    type: STORE_IMAGE,
    source: file,
  };
}

export function storeImageError() {
  return {
    type: STORE_IMAGE_ERROR,
  };
}
